import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';
import PageTitleService from 'ember-page-title/services/page-title';
import './custom-elements/input-in-open-shadow.js';

class Router extends EmberRouter {
  location = 'history';
  rootURL = '/';
}

export class App extends EmberApp {
  modules = {
    './router': Router,
    './services/page-title': PageTitleService,
    ...import.meta.glob('./components/**/*', { eager: true }),
    ...import.meta.glob('./controllers/**/*', { eager: true }),
    ...import.meta.glob('./helpers/**/*', { eager: true }),
    ...import.meta.glob('./routes/**/*', { eager: true }),
    ...import.meta.glob('./services/**/*', { eager: true }),
    ...import.meta.glob('./templates/**/*', { eager: true }),
  };
}

Router.map(function () {
  this.route('test-scenario', function () {
    this.route('mouse-down');
    this.route('touch');
    this.route('keyboard');
    this.route('on-key-helper-examples');
    this.route('on-key-modifier-examples');
  });
});
