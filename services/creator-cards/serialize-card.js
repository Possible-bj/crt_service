const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardsMessages } = require('@app/messages');

/**
 * @typedef {'create' | 'delete' | 'retrieve'} CreatorCardResponseContext
 */

/**
 * Maps internal paranoid `deleted` values to API shape.
 * Active records use 0 in storage; API exposes null.
 * @param {number | null | undefined} deleted
 * @returns {number | null}
 */
function normalizeDeleted(deleted) {
  if (deleted == null || deleted === 0) {
    return null;
  }

  return deleted;
}

function copyLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.map(({ title, url }) => ({ title, url }));
}

function copyServiceRates(serviceRates) {
  if (serviceRates == null) {
    return undefined;
  }

  return {
    currency: serviceRates.currency,
    rates: Array.isArray(serviceRates.rates)
      ? serviceRates.rates.map(({ name, description, amount }) => ({
          name,
          description,
          amount,
        }))
      : [],
  };
}

/**
 * Serializes a creator card document for API responses.
 * @param {Object} card - MongoDB document (lean) or plain object with `_id` or `id`
 * @param {Object} [options]
 * @param {CreatorCardResponseContext} [options.context='retrieve']
 * @returns {Object}
 */
function serializeCreatorCard(card, options = {}) {
  try {
    const { context = 'retrieve' } = options;
    const includeAccessCode = context === 'create' || context === 'delete';

    const serialized = {
      id: card.id ?? card._id,
      title: card.title,
      description: card.description,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: copyLinks(card.links),
      status: card.status,
      access_type: card.access_type ?? 'public',
      created: card.created,
      updated: card.updated,
      deleted: normalizeDeleted(card.deleted),
    };

    const serviceRates = copyServiceRates(card.service_rates);
    if (serviceRates != null) {
      serialized.service_rates = serviceRates;
    }

    if (includeAccessCode) {
      serialized.access_code = card.access_code ?? null;
    }

    return serialized;
  } catch (error) {
    throwAppError(CreatorCardsMessages.FAILED_TO_SERIALIZE_CREATOR_CARD, ERROR_CODE.APPERR);
  }
}

module.exports = serializeCreatorCard;
