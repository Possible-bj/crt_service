const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardsMessages } = require('@app/messages');
const CreatorCards = require('@app/repository/creator-cards');
const serializeCreatorCard = require('./serialize-card');

async function retrieve(serviceData) {
  const query = { slug: serviceData.slug };

  const retrievedData = await CreatorCards.findOne({ query });

  /**
   * 1. If no card with that slug exists → **HTTP 404**, error code `NF01`
   */
  if (!retrievedData) {
    const code = ERROR_CODE.CARD_NOT_FOUND;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * 2. If the card exists but its `status` is `draft` → **HTTP 404**, error code `NF02`
   * - (drafts are not publicly retrievable;
   * - the distinct code lets API callers distinguish "does not exist" from "exists but is a draft")
   */
  if (retrievedData.status === 'draft') {
    const code = ERROR_CODE.CARD_IS_A_DRAFT;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * 3. If the card is `private` and no `access_code` query parameter was supplied → **HTTP 403**, error code `AC03`
   */
  if (retrievedData.access_type === 'private' && !serviceData.access_code) {
    const code = ERROR_CODE.ACCESS_CODE_REQUIRED_TO_VIEW_PRIVATE_CARD;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * 4. If the card is `private` and the supplied `access_code` does not match → **HTTP 403**, error code `AC04`
   */
  if (
    retrievedData.access_type === 'private' &&
    serviceData.access_code !== retrievedData.access_code
  ) {
    const code = ERROR_CODE.INVALID_ACCESS_CODE;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  /**
   * 5. Otherwise → **HTTP 200** with the card data
   */

  const serializedData = serializeCreatorCard(retrievedData, { context: 'retrieve' });

  return {
    data: serializedData,
    message: CreatorCardsMessages.CREATOR_CARD_RETRIEVED_SUCCESSFULLY,
  };
}

module.exports = retrieve;
