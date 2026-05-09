import KeyDownCounter from '../../components/key-down-counter.gjs';
import MouseDownCounter from '../../components/mouse-down-counter.gjs';
import TouchStartCounter from '../../components/touch-start-counter.gjs';

<template>
  <KeyDownCounter
    @parentActivated={{true}}
    @priorityInput={{true}}
    @activatedToggle={{true}}
    @firstResponderToggle={{true}}
    @laxPriorityToggle={{true}}
    @stopImmediatePropagationToggle={{true}}
    @stopPropagationToggle={{true}}
    data-test-counter-first
  />
  <KeyDownCounter
    @parentActivated={{true}}
    @priorityInput={{true}}
    @activatedToggle={{true}}
    @firstResponderToggle={{true}}
    @laxPriorityToggle={{true}}
    @stopImmediatePropagationToggle={{true}}
    @stopPropagationToggle={{true}}
    data-test-counter-second
  />
  <KeyDownCounter
    @parentActivated={{true}}
    @priorityInput={{true}}
    @activatedToggle={{true}}
    @firstResponderToggle={{true}}
    @laxPriorityToggle={{true}}
    @stopImmediatePropagationToggle={{true}}
    @stopPropagationToggle={{true}}
    data-test-counter-third
  />
  <MouseDownCounter
    @parentActivated={{true}}
    @priorityInput={{true}}
    @activatedToggle={{true}}
    @firstResponderToggle={{true}}
    @laxPriorityToggle={{true}}
    @stopImmediatePropagationToggle={{true}}
    @stopPropagationToggle={{true}}
    data-test-mouse-down-counter
  />
  <TouchStartCounter
    @parentActivated={{true}}
    @priorityInput={{true}}
    @activatedToggle={{true}}
    @firstResponderToggle={{true}}
    @laxPriorityToggle={{true}}
    @stopImmediatePropagationToggle={{true}}
    @stopPropagationToggle={{true}}
    data-test-touch-start-counter
  />

  <label for="data-test-input-field">input field</label>
  <input id="data-test-input-field" data-test-input-field />

  <input-in-open-shadow data-test-shadow-dom />
</template>
