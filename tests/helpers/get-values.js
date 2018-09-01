import { findAll } from '@ember/test-helpers';

import { hook } from './hook';


export function getValues() {
  return findAll(`${hook('counter-counter')}`).map(function(element) {
    return parseInt(element.innerText.trim(), 10);
  });
}

export function getMouseValues() {
  return findAll(`${hook('mouse-counter-counter')}`).map(function(element) {
    return parseInt(element.innerText.trim(), 10);
  });
}

export function getTouchValues() {
  return findAll(`${hook('touch-counter-counter')}`).map(function(element) {
    return parseInt(element.innerText.trim(), 10);
  });
}
