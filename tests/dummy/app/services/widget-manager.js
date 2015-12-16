import Ember from 'ember';

const {
  Service,
  isEqual
} = Ember;

export default Service.extend({
  activate(widget) {
    const previousWidget = this.get('activeWidget');

    if (previousWidget && !isEqual(widget, previousWidget)) {
      previousWidget.deactivate();
    }

    this.set('activeWidget', widget);
  }
});
