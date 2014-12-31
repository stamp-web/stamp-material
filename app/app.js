'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
    'core.services',
    'restangular',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/views'});
}]).
run(function(Restangular, LocationServices) {
  var webapp = LocationServices.getWebAppPath();
  //logger.info("Configuring Restangular to use a base url of " + webapp);
  Restangular.setBaseUrl('/' + webapp + '/rest');
});
