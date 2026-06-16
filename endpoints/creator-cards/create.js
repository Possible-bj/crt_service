const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const createService = require('@app/services/creator-cards/create');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-cards-request-completed');
  },
  async handler(rc, helpers) {
    const payload = rc.body;

    const response = await createService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response.data,
      message: response.message,
    };
  },
});
