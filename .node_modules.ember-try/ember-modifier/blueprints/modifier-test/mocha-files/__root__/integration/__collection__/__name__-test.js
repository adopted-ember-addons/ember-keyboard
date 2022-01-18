import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('<%= friendlyTestName %>', function() {
  setupRenderingTest();

  // Replace this with your real tests.
  it('renders', async function() {
    await render(hbs`<div {{<%= dasherizedModuleName %>}}></div>`);

    expect(true).to.be.true;
  });
});
