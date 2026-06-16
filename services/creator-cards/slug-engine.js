const { randomInt } = require('crypto');
const { ERROR_CODE, throwAppError } = require('@app-core/errors');
const CreatorCards = require('@app/repository/creator-cards');
const handleDbError = require('@app/services/errors/handle-db-error');
const { CreatorCardsMessages } = require('@app/messages');

const SLUG_ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-_';

function isWhitespace(char) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

/**
 * Normalizes a slug to lowercase, replaces whitespace with hyphens, and removes any characters that are not letters, numbers, hyphens, or underscores.
 * @param {string | null | undefined} slug
 * @returns {string | null}
 */
function normalizeSlug(slug) {
  if (slug == null || slug === '') {
    return null;
  }

  const lowered = slug.toLowerCase();
  let normalized = '';

  for (let i = 0; i < lowered.length; i++) {
    const char = lowered.charAt(i);

    if (isWhitespace(char)) {
      normalized += '-';
    } else if (SLUG_ALLOWED_CHARS.includes(char)) {
      normalized += char;
    }
  }

  return normalized.slice(0, 50);
}

/**
 * @returns {string} - A 6 character random suffix
 */
function generateRandomSuffix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';

  for (let i = 0; i < 6; i++) {
    suffix += chars[randomInt(chars.length)];
  }

  return suffix;
}

/**
 *
 * @param {string} slug - The slug to check for duplicates
 * @param {string} mode "auto-generate" | "client-provided"
 * @returns {Promise<boolean>}
 */
async function checkSlugDuplicates(slug, mode = 'client-provided') {
  try {
    const duplicateSlug = await CreatorCards.findOne({ query: { slug } }, { lean: true });

    if (!duplicateSlug) {
      return false;
    }

    /** return true if the slug is already taken and the mode is auto-generate
     * - don't throw an error to enable the slug engine to generate a new slug
     */
    if (mode === 'auto-generate' && duplicateSlug) {
      return true;
    }

    /** return true if the slug is already taken and the mode is client-provided
     * - throw an error to prevent the slug engine from generating a new slug
     */
    if (mode === 'client-provided' && duplicateSlug) {
      const code = ERROR_CODE.SLUG_ALREADY_TAKEN;
      const message = CreatorCardsMessages[code];
      throwAppError(message, code);
    }

    return true;
  } catch (error) {
    handleDbError(error);
  }
}

/**
 * Resolves a unique slug by appending a random suffix until none is taken.
 * @param {string} baseSlug
 * @returns {Promise<string>}
 */
async function resolveUniqueSlugWithSuffix(baseSlug) {
  const candidate = `${baseSlug}-${generateRandomSuffix()}`;
  const isTaken = await checkSlugDuplicates(candidate, 'auto-generate');

  if (isTaken) {
    return resolveUniqueSlugWithSuffix(baseSlug);
  }

  return candidate;
}

/**
 * Auto-generates a slug from the title
 * @param {string} title - The title of the creator card
 * @returns {Promise<string>} - The normalized slug
 */
async function autoGenerateSlugFromTitle(title) {
  const normalizedSlug = normalizeSlug(title) ?? 'crt';

  if (normalizedSlug.length < 5) {
    return resolveUniqueSlugWithSuffix(normalizedSlug);
  }

  const isTaken = await checkSlugDuplicates(normalizedSlug, 'auto-generate');
  if (isTaken) {
    return resolveUniqueSlugWithSuffix(normalizedSlug);
  }

  return normalizedSlug;
}

/**
 * Serializes a creator card document for API responses.
 * @param {string}  slug - The slug of the creator card
 * @param {String} title - The title of the creator card
 * @param
 * @returns {Object}
 */

/** Slug Rules
 * Slug Auto-Generation:
 * - If slug is omitted, your service must auto-generate one from the title:
 * - Lowercase the title
 * - Replace whitespace with hyphens
 * - Remove any characters that are not letters, numbers, hyphens, or underscores
 * - If the result is shorter than 5 characters
 * - OR already taken by another card, append a hyphen followed by a random 6-character alphanumeric suffix (e.g., cook-a8x2k1)
 * - If slug IS provided by the client and is already taken, return the SL02 error
 * - do NOT silently modify a client-provided slug.
 */
async function executeSlugEngine(slug, title) {
  let normalizedSlug = normalizeSlug(slug);

  /** 
    - If the api caller provides a slug that contains less than 5 characters
    - but bypasses the validator, because it contained characters that are not letters, numbers, hyphens, or underscores or whitespace
    - we need to throw an error 
    - @important Permission to extend the slug error code to SL03 - invalid slug characters
    - @important using length comparison to check if the slug is less than 5 characters yet not null 
    - we can say that the api caller sent invalid characters because we had just normalised and removed them
  */
  if (normalizedSlug && normalizedSlug.length > 1 && normalizedSlug.length < 5) {
    const code = ERROR_CODE.INVALID_SLUG_CHARACTERS;
    const message = CreatorCardsMessages[code];
    throwAppError(message, code);
  }

  // If slug IS provided by the client and is already taken, return the SL02 error
  if (normalizedSlug) {
    await checkSlugDuplicates(normalizedSlug, 'client-provided');
  }

  // Switch to title if slug is null
  if (!normalizedSlug && title?.trim()) {
    normalizedSlug = await autoGenerateSlugFromTitle(title);
  }

  return normalizedSlug;
}

module.exports = executeSlugEngine;
