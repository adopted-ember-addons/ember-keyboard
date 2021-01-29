import TextArea from '@ember/component/text-area';
import TextField from '@ember/component/text-field';
import {
  EKMixin,
  EKFirstResponderOnFocusMixin
} from 'ember-keyboard';
import { deprecate } from '@ember/debug';

export function initialize(application) {
  if (application) {
    let config = application.resolveRegistration('config:environment') || {};
    let emberKeyboardConfig = config.emberKeyboard || {};
    let disableInputsInitializer = Boolean(emberKeyboardConfig.disableInputsInitializer);
    if (disableInputsInitializer) {
      return;
    }
  }

deprecate(
    'The `ember-keyboard-first-responder-inputs` initializer is deprecated and will be removed in 7.0. Please use the `on-key` modifier with your text fields instead.',
    false,
    {
        id: 'ember-keyboard.first-responder-inputs',
        for: 'ember-keyboard',
        since: '6.0.2',
        until: '7.0.0',
        url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#first-responder-inputs'
    }
  );
  TextField.reopen(EKMixin, EKFirstResponderOnFocusMixin);
  TextArea.reopen(EKMixin, EKFirstResponderOnFocusMixin);
}

export default {
  name: 'ember-keyboard-first-responder-inputs',
  initialize: initialize
};
