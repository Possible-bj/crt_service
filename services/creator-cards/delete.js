const validator = require('@app-core/validator');
// const { throwAppError } = require('@app-core/errors');

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

  return validatedData;
}

module.exports = create;
