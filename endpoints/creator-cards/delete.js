const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const deleteService = require('@app/services/creator-cards/delete');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-cards-request-completed');
  },
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const payload = rc.body;

    const response = await deleteService(slug, payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response.data,
      message: response.message,
      code: response.code,
    };
  },
});
