import Service from '@ember/service';
import { isEqual } from '@ember/utils';

export default Service.extend({
  activate(widget) {
    const previousWidget = this.get('activeWidget');

    if (previousWidget && !isEqual(widget, previousWidget)) {
      previousWidget.deactivate();
    }

    this.set('activeWidget', widget);
  }
});
