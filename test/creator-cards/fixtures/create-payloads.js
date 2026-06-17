/**
 * POST /creator-cards request bodies from docs/instruction.md (Test Cases 1–3, 7–10).
 */

/** Test Case 1 — Full creation */
const fullCreation = {
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
};

/** Test Case 2 — Slug auto-generation (slug omitted) */
const slugAutoGenerate = {
  title: 'Ada Designs Things',
  creator_reference: 'crt_a1b2c3d4e5f6g7h8',
  status: 'published',
};
const expectedSlugForAutoGenerate = 'ada-designs-things';

/** Test Case 3 — Private card creation */
const privateCard = {
  title: 'VIP Rate Card',
  creator_reference: 'crt_x9y8z7w6v5u4t3s2',
  status: 'published',
  access_type: 'private',
  access_code: 'A1B2C3',
};

/** Test Case 7 — Duplicate slug (run after Test Case 1 or stub existing slug) */
const duplicateSlug = {
  title: 'Another George',
  slug: 'george-cooks',
  creator_reference: 'crt_m1n2b3v4c5x6z7l8',
  status: 'published',
};

/** Test Case 8 — Missing access_code on private card */
const missingAccessCodeOnPrivateCard = {
  title: 'Secret Card',
  creator_reference: 'crt_q1w2e3r4t5y6u7i8',
  status: 'published',
  access_type: 'private',
};

/** Test Case 9 — access_code on a public card */
const accessCodePresentOnPublicCard = {
  title: 'Public Card',
  creator_reference: 'crt_q1w2e3r4t5y6u7i8',
  status: 'published',
  access_type: 'public',
  access_code: 'A1B2C3',
};

/** Test Case 10 — Framework validation failure (invalid status enum) */
const invalidStatusOnCardCreation = {
  title: 'Bad Status Card',
  creator_reference: 'crt_q1w2e3r4t5y6u7i8',
  status: 'archived',
};

module.exports = {
  fullCreation,
  slugAutoGenerate,
  expectedSlugForAutoGenerate,
  privateCard,
  duplicateSlug,
  missingAccessCodeOnPrivateCard,
  accessCodePresentOnPublicCard,
  invalidStatusOnCardCreation,
};
