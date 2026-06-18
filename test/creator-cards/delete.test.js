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

    // expect to have the deleted property
    expect(retrievedCard).to.have.property('deleted');
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

    // expect status code to be 404
    expect(response.statusCode).to.be.equal(404);

    const responseData = response.data;

    // expect error code to be NF01
    expect(responseData.code).to.equal(ERROR_CODE.CARD_NOT_FOUND);
  });

  // additional tests
  it('Test Case 17 - Deleting a card with the wrong creator_reference', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.deleteCardPayload,
    });

    const response = await server.delete('/creator-cards/ada-designs-things', {
      body: { creator_reference: 'crt_a1b2c3d4e5f6g7h5' },
    });
    // expect status code to be 403
    expect(response.statusCode).to.be.equal(403);

    const responseData = response.data;

    // expect error code to be CR02
    expect(responseData.code).to.equal(ERROR_CODE.INVALID_CREATOR_REFERENCE);
  });

  it('Test Case 18 - Deleting a card with the right creator_reference', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.deleteCardPayload,
    });
    const { slug, creator_reference: creatorReference } = payloads.deleteCardPayload;

    const response = await server.delete(`/creator-cards/${slug}`, {
      body: { creator_reference: creatorReference },
    });
    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const deletedCard = response.data.data;

    // expect to have the deleted property
    expect(deletedCard).to.have.property('deleted');
  });

  it('Test Case 19 - Deleting a private card with the wrong access_code', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.privateCreatorCard,
    });
    const { slug, creator_reference: creatorReference } = payloads.privateCreatorCard;
    const response = await server.delete(`/creator-cards/${slug}?access_code=WRONG1`, {
      body: { creator_reference: creatorReference },
    });
    // expect status code to be 403
    expect(response.statusCode).to.be.equal(403);

    const responseData = response.data;
    // expect error code to be AC04
    expect(responseData.code).to.equal(ERROR_CODE.INVALID_ACCESS_CODE);
  });

  it('Test Case 20 - Deleting a private card with the right access_code', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.privateCreatorCard,
    });
    const {
      slug,
      creator_reference: creatorReference,
      access_code: accessCode,
    } = payloads.privateCreatorCard;
    const response = await server.delete(`/creator-cards/${slug}?access_code=${accessCode}`, {
      body: { creator_reference: creatorReference },
    });
    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const deletedCard = response.data.data;
    // expect to have the deleted property
    expect(deletedCard).to.have.property('deleted');
  });
});
