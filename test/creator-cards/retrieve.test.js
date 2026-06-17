// tests/creator-cards/retrieve.test.js

const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');
const { ERROR_CODE } = require('@app-core/errors');
const payloads = require('./fixtures/retrieve-payloads');

const server = createMockServer(['endpoints/creator-cards/retrieve.js']);
const creatorCardsStub = MockModelStubs.CreatorCards;

describe('GET /creator-cards/:slug?access_code=?', () => {
  let activeStubConfig;

  afterEach(() => {
    activeStubConfig.revert();
  });

  it('Test Case 4 - Retrieving a public published card', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.publicPublishedCard,
    });

    const response = await server.get('/creator-cards/george-cooks');

    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const retrievedCard = response.data.data;

    // expect access_code to not be present
    expect(retrievedCard).to.not.have.property('access_code');

    // expect id not _id
    expect(retrievedCard).to.have.property('id');
    expect(retrievedCard).to.not.have.property('_id');
  });

  it('Test Case 5 - Retrieving a private card with correct pin', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.privateCardWithCorrectPin,
    });

    const { slug, access_code: accessCode } = payloads.privateCardWithCorrectPin;

    const response = await server.get(`/creator-cards/${slug}?access_code=${accessCode}`);

    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const retrievedCard = response.data.data;

    // expect access_code to not be present
    expect(retrievedCard).to.not.have.property('access_code');
  });

  it('Test Case 11 - Retrieving a non-existent card', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: true,
      docConfig: null,
    });

    const response = await server.get('/creator-cards/does-not-exist-123');

    // expect status code to be 404
    expect(response.statusCode).to.be.equal(404);

    const responseData = response.data;

    // expect code to be 'NF01'
    expect(responseData.code).to.equal(ERROR_CODE.CARD_NOT_FOUND);
  });

  it('Test Case 12 - Retrieving a draft card', async () => {
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: payloads.draftCard,
    });

    const response = await server.get('/creator-cards/my-draft-card');

    // expect status code to be 404
    expect(response.statusCode).to.be.equal(404);

    const responseData = response.data;

    // expect code to be 'NF02'
    expect(responseData.code).to.equal(ERROR_CODE.CARD_IS_A_DRAFT);
  });
});
