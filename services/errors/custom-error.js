/**
 * Custom error response class that extends the Error class
 * @param {Error} error
 * @param {Object} responseBody
 */
function customErrorResponse(error, responseBody) {
  const customeBody = responseBody;
  customeBody.code = error.errorCode ?? null;

  return customeBody;
}

module.exports = customErrorResponse;
