import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  sections: [{
    route: 'index',
    name: 'Overview'
  }, {
    route: 'usage',
    name: 'Usage'
  }, {
    route: 'priority',
    name: 'Priority'
  }, {
    route: 'mixins',
    name: 'Mixins'
  }, {
    route: 'testing',
    name: 'Testing'
  }]
});
