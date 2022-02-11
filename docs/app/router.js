import EmberRouter from '@ember/routing/router';
import config from 'docs/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('deprecations');
  this.route('event-propagation');
  this.route('priority');
  this.route('testing');
  this.route('upgrading');
  this.route('usage');
});
