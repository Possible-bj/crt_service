const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const retrieveService = require('@app/services/creator-cards/retrieve');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-cards-request-completed');
  },
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const { access_code: accessCode } = rc.query;

    const response = await retrieveService({ slug, access_code: accessCode });

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response.data,
      message: response.message,
    };
  },
});
