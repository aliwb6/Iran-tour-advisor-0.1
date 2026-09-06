import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPublicProfileVisibility } from '../src/lib/publicProfiles.js';

test('public profile queries exclude unapproved, rejected, and opted-out profiles', () => {
  const filters = [];
  const query = {
    eq(column, value) {
      filters.push([column, value]);
      return this;
    },
  };

  assert.equal(applyPublicProfileVisibility(query), query);
  assert.deepEqual(filters, [
    ['is_approved', true],
    ['is_rejected', false],
    ['is_published', true],
    ['is_public', true],
  ]);
});
