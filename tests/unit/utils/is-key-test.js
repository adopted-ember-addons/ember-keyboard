import { module, skip, test } from 'qunit';
import isKey from 'ember-keyboard/utils/is-key';

module('Unit | Utility | isKey', function() {
  let table = `
                           |    keydown event                   |    result
  listenerName             |  alt ctrl meta shift key  code     |  expected  pending   note
  --------------------------------------------------------------------------------------------------------------------
  keydown:alt+c            |  T   F    F    F     c    KeyC     |  T         F
  keyup:alt+c              |  T   F    F    F     c    KeyC     |  F         F
  keypress:alt+c           |  T   F    F    F     c    KeyC     |  F         F
  keydown:alt+c            |  T   F    F    F     j    KeyC     |  F         F         simulates dvorak j
  keydown:alt+c            |  T   F    F    F     c    KeyI     |  T         F         simulates dvorak c
  keydown:alt+c            |  T   F    F    F     ç    KeyC     |  T         T         simulates Mac alt+c
  keydown:alt+KeyC         |  T   F    F    F     c    KeyC     |  T         F
  keydown:alt+c            |  F   F    F    F     c    KeyC     |  F         F         alt not pressed
  keydown:alt+c            |  T   F    F    T     c    KeyC     |  F         F         alt+shift pressed
  keydown:alt+KeyC         |  F   F    F    F     c    KeyC     |  F         F         alt not pressed
  keydown:alt+KeyC         |  T   F    F    T     c    KeyC     |  F         F         alt+shift pressed
  keydown:shift+c          |  F   F    F    T     c    KeyC     |  T         F
  keydown:shift+KeyC       |  F   F    F    T     c    KeyC     |  T         F
  keydown:ctrl+shift+t     |  F   T    F    T     t    KeyT     |  T         F
  keydown:ctrl+shift+KeyT  |  F   T    F    T     t    KeyT     |  T         F
  keydown:alt+Digit2       |  T   F    F    F     2    Digit2   |  T         F
  keydown:shift+Digit2     |  F   F    F    T     @    Digit2   |  T         F
  keydown:shift+2          |  F   F    F    T     @    Digit2   |  T         T
  keydown:@                |  F   F    F    F     @    Digit2   |  T         F
  keydown:?                |  F   F    F    T     ?    Slash    |  T         T
  keydown:ctrl+?           |  F   T    F    T     ?    Slash    |  T         T
  keydown:ctrl+Slash       |  F   T    F    F     /    Slash    |  T         F
  keydown:ctrl+Slash       |  F   T    F    T     ?    Slash    |  F         F
  keydown:/                |  F   F    F    F     /    Slash    |  T         F         slash key with us language
  keydown:/                |  F   F    F    F     -    Slash    |  F         F         same key with german language
  keydown:/                |  F   F    F    F     /    Digit7   |  T         F         slash key on german keyboard
  keydown:_all             |  F   F    F    F     /    Digit7   |  T         F         
  keydown:_all             |  T   F    F    F     c    KeyC     |  T         F         
  keydown:_all             |  F   T    F    F     ç    KeyC     |  T         F         
  `;
  for (let line of table.split("\n").map(line => line.trim().replace(/\|/g, ''))) {
    if (line === '' || line.match(/^listenerName|keydown event|---/)) { continue; } // blank or header row
    buildTestFromLine(line);
  }
});
    
function stringToBoolean(s) {
  if (s === 'T') return true;
  if (s === 'F') return false;
  throw new Error(`Invalid boolean string value: ${s}. Must be 'T' or 'F'`);
}

function buildTestFromLine(line) {
  let [listenerName,alt,ctrl,meta,shift,key,code,expected,pending,...note] = line.split(/\s+/);
  let altKey = stringToBoolean(alt);
  let ctrlKey = stringToBoolean(ctrl);
  let metaKey = stringToBoolean(meta);
  let shiftKey = stringToBoolean(shift);
  let expectedResult = stringToBoolean(expected);
  let isPending = stringToBoolean(pending);
  let testDescription = `with "${listenerName}", `;
  note = note ? note.join(' ') : null;
  testDescription += expectedResult ? 'should ' : 'should not ';
  testDescription += `match keydown event with `;
  testDescription += `key: ${key}, `;
  testDescription += `code: ${code}, `;
  testDescription += `with modifiers `;
  let modifiers = [];
  if (altKey) {
    modifiers.push('alt');
  }
  if (ctrlKey) {
    modifiers.push('ctrl');
  }
  if (metaKey) {
    modifiers.push('meta');
  }
  if (shiftKey) {
    modifiers.push('shift');
  }
  testDescription += modifiers.join('+');
  let testFunc = isPending ? skip : test;
  testFunc(testDescription, async function(assert) {
    let fakeEvent = new KeyboardEvent('keydown', { key, code, altKey, ctrlKey, metaKey, shiftKey });
    if (expectedResult) {
      let expectedTriggerMessage = `should match${note ? ', ' + note : ''}`;
      assert.ok(isKey(listenerName, fakeEvent), expectedTriggerMessage);
    } else {
      let expectedNoTriggerMessage = `should not match${note ? ', ' + note : ''}`;
      assert.ok(!isKey(listenerName, fakeEvent), expectedNoTriggerMessage);
    }
  });
}