/**
 * POST /creator-cards request bodies from docs/instruction.md (Test Cases 6, 15–16).
 */

/** Test Case 6 — Deleting a card */
const deleteCardPayload = {
  title: 'Ada Designs Things',
  description: 'Weekly cooking podcast',
  slug: 'ada-designs-things',
  creator_reference: 'crt_a1b2c3d4e5f6g7h8',
  links: [{ title: 'YouTube', url: 'https://youtube.com/@ada-designs-things' }],
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
};

/** Test Case 16 — Retrieving a deleted card */
const deletedCard = {
  title: 'Ada Designs Things',
  description: 'Weekly cooking podcast',
  slug: 'ada-designs-things',
  creator_reference: 'crt_a1b2c3d4e5f6g7h8',
  links: [{ title: 'YouTube', url: 'https://youtube.com/@ada-designs-things' }],
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
  deleted: 1781742139841,
};

/** Test Case 19 — Deleting a private card with the wrong access_code */
const privateCreatorCard = {
  title: 'Private Creator Card',
  description: 'Weekly cooking podcast',
  slug: 'private-creator-card',
  creator_reference: 'crt_a1b2c3d4e5f6g7h8',
  status: 'published',
  access_type: 'private',
  access_code: 'A1B2C3',
};

module.exports = {
  deleteCardPayload,
  deletedCard,
  privateCreatorCard,
};
