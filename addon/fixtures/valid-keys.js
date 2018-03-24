import codeMap from 'ember-keyboard/fixtures/code-map';
import validModifiers from 'ember-keyboard/fixtures/modifiers-array';
import nonUniqueValidKeys from 'ember-keyboard/fixtures/non-unique-valid-keys';

const keyMapValues = Object.keys(codeMap).map((key) => codeMap[key]);

export default keyMapValues.concat(validModifiers).concat(nonUniqueValidKeys);
