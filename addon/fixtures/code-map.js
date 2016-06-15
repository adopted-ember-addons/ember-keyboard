import generateCodeMap from 'ember-keyboard/utils/generate-code-map';

const { platform, product } = navigator;

export default generateCodeMap(platform, product);
