// tests/creator-cards/create.test.js

// process.env.USE_MOCK_MODEL = '1';

const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');
const { ERROR_CODE } = require('@app-core/errors/constants');
const payloads = require('./fixtures/create-payloads');

const server = createMockServer(['endpoints/creator-cards/create.js']);
const creatorCardsStub = MockModelStubs.CreatorCards;

describe('POST /creator-cards', () => {
  let activeStubConfig;

  beforeEach(() => {
    // Prevent duplicate-slug path for happy-path tests.
    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: true,
    });
  });

  afterEach(() => {
    activeStubConfig.revert();
  });

  it('Test Case 1 - should create a creator card with full payload', async () => {
    const response = await server.post('/creator-cards', {
      body: payloads.fullCreation,
    });

    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const createdCard = response.data.data;

    // expect id not _id
    expect(createdCard).to.have.property('id');
    expect(createdCard).to.not.have.property('_id');

    // expect access_type to be public
    expect(createdCard.access_type).to.equal('public');
  });

  it('Test Case 2 - Slug auto-generation', async () => {
    const response = await server.post('/creator-cards', {
      body: payloads.slugAutoGenerate,
    });

    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const createdCard = response.data.data;
    // expect slug to ge auto generated
    expect(createdCard.slug).to.equal(payloads.expectedSlugForAutoGenerate);
  });

  it('Test Case 3 - Private card creation', async () => {
    const response = await server.post('/creator-cards', {
      body: payloads.privateCard,
    });

    // expect status code to be 200
    expect(response.statusCode).to.be.equal(200);

    const createdCard = response.data.data;

    // expect access_code to be present
    expect(createdCard).to.have.property('access_code');

    // expect access_code to be equal to payloads.privateCard.access_code
    expect(createdCard.access_code).to.equal(payloads.privateCard.access_code);
  });

  it('Test Case 7 - Duplicate slug', async () => {
    activeStubConfig.revert();

    activeStubConfig = creatorCardsStub.configureStubs({
      method: 'findOne',
      mockNull: false,
      docConfig: { slug: payloads.duplicateSlug.slug },
    });

    const response = await server.post('/creator-cards', {
      body: payloads.duplicateSlug,
    });

    // expect status code to be 400
    expect(response.statusCode).to.be.equal(400);

    const responseData = response.data;
    // expect error code to be SL02
    expect(responseData.code).to.equal(ERROR_CODE.SLUG_ALREADY_TAKEN);
  });

  it('Test Case 8 - Missing access_code on private card', async () => {
    const response = await server.post('/creator-cards', {
      body: payloads.missingAccessCodeOnPrivateCard,
    });

    // expect status code to be 400
    expect(response.statusCode).to.be.equal(400);

    const responseData = response.data;
    // expect error code to be AC01
    expect(responseData.code).to.equal(ERROR_CODE.ACCESS_CODE_REQUIRED);
  });

  it('Test Case 9 - access_code on a public card', async () => {
    const response = await server.post('/creator-cards', {
      body: payloads.accessCodePresentOnPublicCard,
    });

    // expect status code to be 400
    expect(response.statusCode).to.be.equal(400);

    const responseData = response.data;
    // expect error code to be AC05
    expect(responseData.code).to.equal(ERROR_CODE.ACCESS_CODE_CAN_ONLY_BE_SET_ON_PRIVATE_CARDS);
  });

  it('Test Case 10 - Framework validation failure', async () => {
    const response = await server.post('/creator-cards', {
      body: payloads.invalidStatusOnCardCreation,
    });

    // expect status code to be 400 - checking for only HTTP status code
    expect(response.statusCode).to.be.equal(400);
  });
});
