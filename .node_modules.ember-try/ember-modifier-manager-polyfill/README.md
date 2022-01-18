ember-modifier-manager-polyfill
==============================================================================

This addon provides a polyfill for implementing element modifier managers as
described in [emberjs/rfcs#373](https://emberjs.github.io/rfcs/0373-Element-Modifier-Managers.html).


Compatibility
------------------------------------------------------------------------------

* Completely inert when running `ember-source` 3.8 or higher
* Tested against `ember-source` v2.12, v2.16, v2.18, v3.4, v3.5, v3.6, v3.7 in CI


Installation
------------------------------------------------------------------------------

```
ember install ember-modifier-manager-polyfill
```


Usage
------------------------------------------------------------------------------

At this point the best documentation is likely still the [the RFC
itself](https://emberjs.github.io/rfcs/0373-Element-Modifier-Managers.html),
but here are a few simple examples (shamelessly stolen from another modifier
RFC [emberjs/rfcs#353](https://github.com/emberjs/rfcs/pull/353)):

### Performance Marking

```hbs
<section id="about-us" {{performance 'mark' 'about-page'}}>
  <h1>About Us</h1>
  {{!-- snip --}}
</section>
```

```js
// app/modifiers/performance.js
import Ember from 'ember';

export default Ember._setModifierManager(
  () => ({
    createModifier() {},

    installModifier(_instance, _element, args) {
      let [type, name] = args.positional;

      performance[type](name);
    },

    updateModifier() {},
    destroyModifier() {},
  }),
  class PerformanceModifier {}
);
```

### jQuery Widget
```hbs
<input type="date" {{datepicker changeMonth=true changeYear=true}} />
```

```js
// app/modifiers/datepicker.js
import Ember from 'ember';
import $ from 'jquery';

export default Ember._setModifierManager(
  () => ({
    createModifier() {
      return { element: null };
    },

    installModifier(state, element, args) {
      let options = Object.assign({ minDate: 20, maxDate: '+1M +10D' }, args.named);

      // setup state bucket for use in destroyModifier
      state.element = element;
      state.options = options;

      $(this.element).datepicker(options);
    },

    updateModifier() {},
    destroyModifier(state) {
      $(state.element).datepicker(state.options);
    },
  }),
  class DatepickerModifier {}
);
```

### Page View Tracking
```hbs
<section {{track-impression eventCategory="Post"}}>
  <header>Chad liked a post</header>
  <img src="cat.jpg">
  {{!-- Snip --}}
<section>
```

```js
// app/modifiers/track-impression.js
import Ember from 'ember';

export default Ember._setModifierManager(
  owner => ({
    createModifier() {
      return { element: null, observer: null };
    },

    installModifier(state, element, args) {
      let ga = owner.lookup('service:ga');
      let { eventCategory } = args.named;

      let interSectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => ga.send('event', 'impression', eventCategory));
      });

      // setup state bucket for use in destroyModifier
      state.element = element;
      state.observer = interSectionObserver;
    },

    updateModifier() {},
    destroyModifier(state) {
     state.observer.unobserve(state.element);
    },
  }),
  class TrackImpressionModifier {}
);
```


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
