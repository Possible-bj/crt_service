const totalTests = 16;
const totalPlusAdditionalTests = 19;

const createTests = [
  'Test Case 1 - Full creation',
  'Test Case 2 - Slug auto-generation (slug omitted)',
  'Test Case 3 - Private card creation',
  'Test Case 7 - Duplicate slug (run after Test Case 1 or stub existing slug)',
  'Test Case 8 - Missing access_code on private card',
  'Test Case 9 - access_code on a public card',
  'Test Case 10 - Framework validation failure (invalid status enum)',
]; // 7 tests

const retrieveTests = [
  'Test Case 4 - Retrieving a public published card',
  'Test Case 5 - Retrieving a private card with correct pin',
  'Test Case 11 - Retrieving a non-existent card',
  'Test Case 12 - Retrieving a draft card',
  'Test Case 13 - Retrieving a private card without a pin',
  'Test Case 14 - Retrieving a private card with a wrong pin',
]; // 6 tests

const deleteTests = [
  'Test Case 6 - Deleting a card',
  'Test Case 15 - Deleting a non-existent card',
  'Test Case 16 - Retrieving a deleted card',
]; // 3 tests

// additional tests
const additionalTests = [
  'Test Case 17 - Deleting a card with the wrong creator_reference',
  'Test Case 18 - Deleting a private card with the right access_code',
  'Test Case 19 - Deleting a private card with the wrong access_code',
]; // 3 tests
