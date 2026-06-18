const validator = require('@app-core/validator');
const CreatorCards = require('@app/repository/creator-cards');
const handleDbError = require('@app/services/errors/handle-db-error');
const { CreatorCardsMessages } = require('@app/messages');
const executeSlugEngine = require('./slug-engine');
const serializeCreatorCard = require('./serialize-card');
const validateAccessCode = require('./access-code');

const createSpec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedCreateSpec = validator.parse(createSpec);

async function create(serviceData) {
  const validatedData = validator.validate(serviceData, parsedCreateSpec);

  const cardPayload = {
    ...validatedData,
    access_type: validatedData.access_type ?? 'public',
  };

  validateAccessCode({
    accessType: cardPayload.access_type,
    accessCode: cardPayload.access_code,
  });

  cardPayload.slug = await executeSlugEngine({
    slug: cardPayload.slug,
    title: cardPayload.title,
  });

  let createdCard = null;
  try {
    createdCard = await CreatorCards.create(cardPayload);
  } catch (error) {
    handleDbError(error);
  }

  const serializedCard = serializeCreatorCard(createdCard, { context: 'create' });
  return {
    data: serializedCard,
    message: CreatorCardsMessages.CREATOR_CARD_CREATED_SUCCESSFULLY,
  };
}

module.exports = create;
