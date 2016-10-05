import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('test-scenario');
  this.route('mixins');
  this.route('priority');
  this.route('usage');
  this.route('testing');
});

export default Router;
