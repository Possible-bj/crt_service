const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

/**
 * Rethrows application errors; converts unexpected DB errors into a safe 500 response.
 * @param {Error} error
 */
function handleDbError(error) {
  if (error?.isApplicationError) {
    throw error;
  }

  appLogger.error(
    { errorMessage: error?.message, errorStack: error?.stack },
    'creator-cards-database-error'
  );

  throwAppError('Some error occurred.', ERROR_CODE.APPERR);
}

module.exports = handleDbError;
