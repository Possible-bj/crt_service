/**
 * @readonly
 * @enum
 */
const ERROR_CODE = {
  AUTHERR: 'AUTHORIZATION_ERROR',
  NOAUTHERR: 'MISSING_AUTHORIZATION',
  INVLDAUTHTOKEN: 'INVALID_AUTH_TOKEN',
  INACTIVEACCT: 'INACTIVE_ACCOUNT',
  EXPIREDTOKEN: 'EXPIRED_TOKEN',
  INVLDREQ: 'INVALID_REQUEST',
  PERMERR: 'PERMISSION_ERROR',
  LIMITERR: 'LIMIT_ERROR',
  FEEERR: 'FEE_ERROR',
  NOTFOUND: 'RESOURCE_NOT_FOUND',
  APPERR: 'APPLICATION_ERROR',
  HTTPREQERR: 'INTERNAL_REQ_ERROR',
  DUPLRCRD: 'DUPLICATE_RECORD',
  VALIDATIONERR: 'VALIDATION_ERROR',
  INVLDDATA: 'INVALID_REQUEST_DATA',
  RTLIMERR: 'RATE_LIMIT_ERROR',

  // Business rule errors
  SLUG_ALREADY_TAKEN: 'SL02', // Slug is already taken
  ACCESS_CODE_REQUIRED: 'AC01', // Access code is required when access type is private
  ACCESS_CODE_CAN_ONLY_BE_SET_ON_PRIVATE_CARDS: 'AC05', // Access code can only be set on private cards
  CARD_NOT_FOUND: 'NF01', // Card not found
  CARD_IS_A_DRAFT: 'NF02', // Card is a draft
  ACCESS_CODE_REQUIRED_TO_VIEW_PRIVATE_CARD: 'AC03', // Access code is required to view private card
  ACCESS_CODE_REQUIRED_TO_DELETE_PRIVATE_CARD: 'AC03', // Access code is required to delete private card
  INVALID_ACCESS_CODE: 'AC04', // Invalid access code

  // Error Code Extension
  INVALID_SLUG_CHARACTERS: 'SL03', // Invalid slug characters
  INVALID_CREATOR_REFERENCE: 'CR02', // Invalid Creator reference
};

const ERROR_STATUS_CODE_MAPPING = {
  AUTHORIZATION_ERROR: 401,
  MISSING_AUTHORIZATION: 401,
  INVALID_AUTH_TOKEN: 401,
  INACTIVE_ACCOUNT: 401,
  EXPIRED_TOKEN: 401,
  PERMISSION_ERROR: 401,
  INVALID_REQUEST: 403,
  LIMIT_ERROR: 403,
  FEE_ERROR: 403,
  RESOURCE_NOT_FOUND: 404,
  DUPLICATE_RECORD: 409,
  APPLICATION_ERROR: 500,
  RATE_LIMIT_ERROR: 429,

  // Business rule errors
  SL02: 400, // Slug is already taken
  AC01: 400, // Access code is required when access type is private
  AC05: 400, // Access code can only be set on private cards
  NF01: 404, // Card not found
  NF02: 404, // Card is a draft
  AC03: 403, // Access code is required to view private card
  AC04: 403, // Invalid access code

  // Error Code Extension
  SL03: 400, // Invalid slug characters
  CR02: 403, // Invalid Creator reference
};

module.exports = { ERROR_CODE, ERROR_STATUS_CODE_MAPPING };
