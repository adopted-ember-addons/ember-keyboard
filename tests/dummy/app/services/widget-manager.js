/* eslint-disable ember/no-classic-classes */
import Service from '@ember/service';
import { isEqual } from '@ember/utils';

export default Service.extend({
  activate(widget) {
    let previousWidget = this.activeWidget;

    if (previousWidget && !isEqual(widget, previousWidget)) {
      previousWidget.deactivate();
    }

    this.set('activeWidget', widget);
  },
});
