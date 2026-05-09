import MouseDownCounter from '../../components/mouse-down-counter.gjs';

<template>
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
</template>
