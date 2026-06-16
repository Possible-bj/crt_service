const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardsMessages } = require('@app/messages');

const ALPHANUMERIC_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function isAlphanumeric(value) {
  for (let i = 0; i < value.length; i++) {
    if (!ALPHANUMERIC_CHARS.includes(value.charAt(i))) {
      return false;
    }
  }

  return true;
}

/**
 * Validates the access code for a creator card.
 * @param {string} accessType - The access type of the creator card.
 * @param {string} accessCode - The access code of the creator card.
 */
function validateAccessCode(accessType, accessCode) {
  try {
    if (accessType === 'private' && !accessCode) {
      const code = ERROR_CODE.ACCESS_CODE_REQUIRED;
      const message = CreatorCardsMessages[code];
      throwAppError(message, code);
    }

    if (accessType === 'private' && accessCode) {
      // Check if the access code is exactly 6 characters long - length is already being validated by the validator - included this just to ensure the access code is exactly 6 characters long
      if (accessCode.length !== 6) {
        throwAppError(
          CreatorCardsMessages.ACCESS_CODE_MUST_BE_6_CHARACTERS_LONG,
          ERROR_CODE.INVALID_ACCESS_CODE
        );
      }

      // Check if the access code is alphanumeric
      if (!isAlphanumeric(accessCode)) {
        throwAppError(
          CreatorCardsMessages.ACCESS_CODE_MUST_BE_ALPHANUMERIC,
          ERROR_CODE.INVALID_ACCESS_CODE
        );
      }
    }

    if (accessType === 'public' && accessCode) {
      const code = ERROR_CODE.ACCESS_CODE_CAN_ONLY_BE_SET_ON_PRIVATE_CARDS;
      const message = CreatorCardsMessages[code];
      throwAppError(message, code);
    }

    return true;
  } catch (error) {
    throwAppError(CreatorCardsMessages.FAILED_TO_VALIDATE_ACCESS_CODE, ERROR_CODE.APPERR);
  }
}

module.exports = validateAccessCode;
