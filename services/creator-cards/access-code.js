const { throwAppError, ERROR_CODE, ERROR_MESSAGE_MAPPING } = require('@app-core/errors');

/**
 * Validates the access code for a creator card.
 * @param {string} accessType - The access type of the creator card.
 * @param {string} accessCode - The access code of the creator card.
 */
function validateAccessCode(accessType, accessCode) {
  try {
    if (accessType === 'private' && !accessCode) {
      const code = ERROR_CODE.ACCESS_CODE_REQUIRED;
      const message = ERROR_MESSAGE_MAPPING[code];
      throwAppError(message, code);
    }

    if (accessType === 'private' && accessCode) {
      // Check if the access code is exactly 6 characters long - length is already being validated by the validator - included this just to ensure the access code is exactly 6 characters long
      if (accessCode.length !== 6) {
        throwAppError(
          'Access code must be exactly 6 characters long',
          ERROR_CODE.INVALID_ACCESS_CODE
        );
      }

      // Check if the access code is alphanumeric
      if (!/^[a-zA-Z0-9]+$/.test(accessCode)) {
        throwAppError('Access code must be alphanumeric', ERROR_CODE.INVALID_ACCESS_CODE);
      }
    }

    if (accessType === 'public' && accessCode) {
      const code = ERROR_CODE.ACCESS_CODE_CAN_ONLY_BE_SET_ON_PRIVATE_CARDS;
      const message = ERROR_MESSAGE_MAPPING[code];
      throwAppError(message, code);
    }

    return true;
  } catch (error) {
    throwAppError('Failed to validate access code', ERROR_CODE.APPERR);
  }
}

module.exports = validateAccessCode;
