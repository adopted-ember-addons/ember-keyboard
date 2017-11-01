import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
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
