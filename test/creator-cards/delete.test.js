// tests/creator-cards/delete.test.js

const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');
const { ERROR_CODE } = require('@app-core/errors');
const payloads = require('./fixtures/delete-payloads');

const server = createMockServer([
  'endpoints/creator-cards/delete.js',
  'endpoints/creator-cards/retrieve.js',
]);
const creatorCardsStub = MockModelStubs.CreatorCards;

describe('DELETE /creator-cards/:slug', () => {
  let activeStubConfig;

  afterEach(() => {
    activeStubConfig.revert();
  });

  it('Test Case 6 - Deleting a card', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.deleteCardPayload,
    });

    const response = await server.delete('/creator-cards/ada-designs-things', {
      body: { creator_reference: 'crt_a1b2c3d4e5f6g7h8' },
    });

    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const retrievedCard = response.data.data;

    // expect access_code to be present
    expect(retrievedCard).to.have.property('access_code');

    // expect id not _id
    expect(retrievedCard).to.have.property('id');
    expect(retrievedCard).to.not.have.property('_id');
  });

  it('Test Case 15 - Deleting a non-existent card', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: true,
      docConfig: null,
    });

    const response = await server.delete('/creator-cards/does-not-exist-123', {
      body: { creator_reference: 'crt_a1b2c3d4e5f6g7h8' },
    });

    // expect status code to be 404
    expect(response.statusCode).to.be.equal(404);

    const responseData = response.data;

    // expect error code to be NF01
    expect(responseData.code).to.equal(ERROR_CODE.CARD_NOT_FOUND);
  });

  it('Test Case 16 - Retrieving a deleted card', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.deletedCard,
    });

    const response = await server.get('/creator-cards/ada-designs-things');

    console.log('\n\n', response, '\n\n');
    // expect status code to be 404
    expect(response.statusCode).to.be.equal(404);

    const responseData = response.data;

    // expect error code to be NF01
    expect(responseData.code).to.equal(ERROR_CODE.CARD_NOT_FOUND);
  });
});
