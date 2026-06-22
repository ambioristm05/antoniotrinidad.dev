import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  categoryFormToPayload,
  categoryToForm,
  emptyCategoryForm,
} from '../src/services/categoryForm.js';

describe('category form transformations', () => {
  it('trims category values and omits an empty optional slug', () => {
    assert.deepEqual(
      categoryFormToPayload({ ...emptyCategoryForm, name: '  Backend  ', slug: '  ', type: 'post' }),
      { name: 'Backend', type: 'post' },
    );
  });

  it('preserves editable values from an existing category', () => {
    assert.deepEqual(categoryToForm({ name: 'APIs', slug: 'apis', type: 'post' }), {
      name: 'APIs',
      slug: 'apis',
      type: 'post',
    });
  });
});
