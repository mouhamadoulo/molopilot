import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TenantIdSchema } from './index.js';

void test('TenantIdSchema accepts valid uuid', () => {
  const result = TenantIdSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
  assert.equal(result.success, true);
});

void test('TenantIdSchema rejects empty string', () => {
  const result = TenantIdSchema.safeParse('');
  assert.equal(result.success, false);
});
