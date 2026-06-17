/**
 * GET /creator-cards/:slug?access_code=? request bodies from docs/instruction.md (Test Cases 4–5).
 */

/** Test Case 4 — Retrieving a public published card */
const publicPublishedCard = {
  title: 'George Cooks',
  description: 'Weekly cooking podcast',
  slug: 'george-cooks',
  creator_reference: 'crt_8f2k1m9x4p7w3q5z',
  links: [{ title: 'YouTube', url: 'https://youtube.com/@georgecooks' }],
  service_rates: {
    currency: 'NGN',
    rates: [
      {
        name: 'IG Story Post',
        description: 'One story mention',
        amount: 5000000,
      },
    ],
  },
  status: 'published',
  access_type: 'public',
};

/** Test Case 5 — Retrieving a private card with correct pin */
const privateCardWithCorrectPin = {
  title: 'VIP Rate Card',
  description: 'VIP rate card',
  slug: 'vip-rate-card',
  creator_reference: 'crt_8f2k1m9x4p7w3q5z',
  access_code: 'A1B2C3',
  access_type: 'private',
  status: 'published',
  links: [{ title: 'YouTube', url: 'https://youtube.com/@vipratecard' }],
  service_rates: {
    currency: 'NGN',
    rates: [{ name: 'IG Story Post', description: 'One story mention', amount: 5000000 }],
  },
};

/** Test Case 12 — Retrieving a draft card */
const draftCard = {
  title: 'My Draft Card',
  description: 'My draft card - can not be retrieved by public endpoint',
  slug: 'my-draft-card',
  creator_reference: 'crt_8f2k1m9x4p7w3q5z',
  status: 'draft',
};

module.exports = {
  publicPublishedCard,
  privateCardWithCorrectPin,
  draftCard,
};
