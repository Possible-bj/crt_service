const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardsMessages } = require('@app/messages');
const CreatorCards = require('@app/repository/creator-cards');
const handleDbError = require('@app/services/errors/handle-db-error');
const serializeCreatorCard = require('./serialize-card');

const deleteSpec = `root {
  creator_reference string<trim|length:20>
}`;

const parsedDeleteSpec = validator.parse(deleteSpec);

async function deleteCard(serviceData) {
  const validatedData = validator.validate(serviceData, parsedDeleteSpec);

  const query = { slug: serviceData.slug };
  const creatorCard = await CreatorCards.findOne({ query });

  /**
   * - If no card with that slug exists → **HTTP 404**, error code `NF01`
   */
  if (!creatorCard) {
    const code = ERROR_CODE.CARD_NOT_FOUND;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * - @important Permission to extend business rule error code by the creator_reference (CR02)
   * - creator_reference should be required to delete a card; serving as a form of authentication
   * - if it is not yours, you can't delete it
   * - if the provided creator_reference does not match the card's creator_reference, return **HTTP 403**, error code `CR02`
   */
  if (creatorCard.creator_reference !== validatedData.creator_reference) {
    const code = ERROR_CODE.INVALID_CREATOR_REFERENCE;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * - @important Permission to extend business rule logic
   * - if the card is private and the access_code was not provided, return **HTTP 403**, error code `AC03`
   * - if the card is private and the access_code does not match, return **HTTP 403**, error code `AC04`
   * - if the card is public, you can delete it
   */
  if (creatorCard.access_type === 'private' && !serviceData.access_code) {
    const code = ERROR_CODE.ACCESS_CODE_REQUIRED_TO_DELETE_PRIVATE_CARD;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  if (
    creatorCard.access_type === 'private' &&
    creatorCard.access_code !== serviceData.access_code
  ) {
    const code = ERROR_CODE.INVALID_ACCESS_CODE;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * - Once a card is deleted, it must no longer be retrievable via the public retrieval endpoint
   * - (`GET /creator-cards/:slug` returns **HTTP 404**, `NF01`)
   */
  if (creatorCard.deleted) {
    const code = ERROR_CODE.CARD_NOT_FOUND;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * - On success → **HTTP 200**, returning the **deleted card in the same response format as the creation endpoint**
   */
  try {
    await CreatorCards.deleteOne({ query, options: { paranoid: true } });
  } catch (error) {
    handleDbError(error);
  }

  const serializedCard = serializeCreatorCard(creatorCard, { context: 'delete' });

  return {
    data: serializedCard,
    message: CreatorCardsMessages.CREATOR_CARD_DELETED_SUCCESSFULLY,
  };
}

module.exports = deleteCard;
