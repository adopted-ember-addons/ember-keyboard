import KeyDownCounter from '../../components/key-down-counter.gjs';

<template>
  <KeyDownCounter
    @parentActivated={{true}}
    @priorityInput={{true}}
    @activatedToggle={{true}}
    @firstResponderToggle={{true}}
    @laxPriorityToggle={{true}}
    @stopImmediatePropagationToggle={{true}}
    @stopPropagationToggle={{true}}
    data-test-counter
  />
</template>
