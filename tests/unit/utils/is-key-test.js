import { module, skip, test } from 'qunit';
import isKey from 'ember-keyboard/utils/is-key';
import getPlatform from "ember-keyboard/utils/platform";

module('Unit | Utility | isKey', function() {
  let table = `
                                   |    keydown event                   |    result
  listenerName           platform  |  alt ctrl meta shift key  code     |  expected  pending   note
  -----------------------------------------------------------------------------------------------------------------------------
  keydown:alt+c             win    |  T   F    F    F     c    KeyC     |  T         F
  keyup:alt+c               win    |  T   F    F    F     c    KeyC     |  F         F
  keypress:alt+c            win    |  T   F    F    F     c    KeyC     |  F         F
  keydown:alt+c             win    |  T   F    F    F     j    KeyC     |  F         F         simulates dvorak j
  keydown:alt+c             linux  |  T   F    F    F     c    KeyI     |  T         F         simulates dvorak c
  keydown:alt+c             mac    |  T   F    F    F     ç    KeyC     |  T         T         simulates Mac alt+c
  keydown:alt+KeyC          win    |  T   F    F    F     c    KeyC     |  T         F
  keydown:alt+c             win    |  F   F    F    F     c    KeyC     |  F         F         alt not pressed
  keydown:alt+c             win    |  T   F    F    T     c    KeyC     |  F         F         alt+shift pressed
  keydown:alt+KeyC          win    |  F   F    F    F     c    KeyC     |  F         F         alt not pressed
  keydown:alt+KeyC          win    |  T   F    F    T     c    KeyC     |  F         F         alt+shift pressed
  keydown:shift+c           win    |  F   F    F    T     c    KeyC     |  T         F
  keydown:shift+KeyC        win    |  F   F    F    T     c    KeyC     |  T         F
  keydown:ctrl+shift+t      win    |  F   T    F    T     t    KeyT     |  T         F
  keydown:ctrl+shift+KeyT   win    |  F   T    F    T     t    KeyT     |  T         F
  keydown:alt+Digit2        win    |  T   F    F    F     2    Digit2   |  T         F
  keydown:shift+Digit2      win    |  F   F    F    T     @    Digit2   |  T         F
  keydown:shift+2           win    |  F   F    F    T     @    Digit2   |  T         T
  keydown:@                 win    |  F   F    F    F     @    Digit2   |  T         F
  keydown:?                 win    |  F   F    F    T     ?    Slash    |  T         T
  keydown:ctrl+?            win    |  F   T    F    T     ?    Slash    |  T         T
  keydown:ctrl+Slash        win    |  F   T    F    F     /    Slash    |  T         F
  keydown:ctrl+Slash        win    |  F   T    F    T     ?    Slash    |  F         F
  keydown:/                 win    |  F   F    F    F     /    Slash    |  T         F         slash key with us language
  keydown:/                 win    |  F   F    F    F     -    Slash    |  F         F         same key with german language
  keydown:/                 win    |  F   F    F    F     /    Digit7   |  T         F         slash key on german keyboard
  keydown:_all              win    |  F   F    F    F     /    Digit7   |  T         F         
  keydown:_all              win    |  T   F    F    F     c    KeyC     |  T         F         
  keydown:_all              win    |  F   T    F    F     ç    KeyC     |  T         F         
  keydown:Alt+c             win    |  T   F    F    F     c    KeyC     |  T         F       
  keydown:ALT+c             win    |  T   F    F    F     c    KeyC     |  T         F       
  keydown:SHIFT+c           win    |  F   F    F    T     c    KeyC     |  T         F       
  keydown:Shift+KeyC        win    |  F   F    F    T     c    KeyC     |  T         F
  keydown:Ctrl+Shift+t      win    |  F   T    F    T     t    KeyT     |  T         F
  keydown:CTRL+Slash        win    |  F   T    F    F     /    Slash    |  T         F
  keydown:meta+c            win    |  F   F    T    F     c    KeyC     |  T         F
  keydown:cmd+c             mac    |  F   F    T    F     c    KeyC     |  T         F
  keydown:cmd+c             win    |  F   T    F    F     c    KeyC     |  F         F
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
  let [listenerName,plat,alt,ctrl,meta,shift,key,code,expected,pending,...note] = line.split(/\s+/);
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
  let userAgent;
  switch(plat) {
    case 'win':
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36';
      break;
    case 'mac':
      userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36';
      break;
    case 'linux':
      userAgent = 'Mozilla/5.0 (X11; Datanyze; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36';
      break;
  }
  testDescription += modifiers.join('+');
  let testFunc = isPending ? skip : test;
  testFunc(testDescription, async function(assert) {
    let fakeEvent = new KeyboardEvent('keydown', { key, code, altKey, ctrlKey, metaKey, shiftKey });
    if (expectedResult) {
      let expectedTriggerMessage = `should match${note ? ', ' + note : ''}`;
      assert.ok(isKey(listenerName, fakeEvent, getPlatform(userAgent)), expectedTriggerMessage);
    } else {
      let expectedNoTriggerMessage = `should not match${note ? ', ' + note : ''}`;
      assert.ok(!isKey(listenerName, fakeEvent, getPlatform(userAgent)), expectedNoTriggerMessage);
    }
  });
}