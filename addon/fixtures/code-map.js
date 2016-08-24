import generateCodeMap from 'ember-keyboard/utils/generate-code-map';

let platform, product = '';

if (typeof FastBoot === 'undefined') {
  platform = navigator.platform;
  product = navigator.product;
}

export default generateCodeMap(platform, product);
