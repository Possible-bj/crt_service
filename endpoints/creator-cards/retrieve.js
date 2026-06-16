const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-cards-request-completed');
  },
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const { accessCode } = rc.query;

    // Scaffold response
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Retrieved Successfully.',
      data: {
        slug,
        accessCode,
      },
    };
  },
});
