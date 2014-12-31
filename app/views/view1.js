'use strict';

angular.module('myApp.view1', ['ngRoute','stampweb.services'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/views', {
    templateUrl: 'views/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope,LocationServices, Preferences) {
      console.log(LocationServices);
      Preferences.query().then(function(data) {
        console.log(data);
      })
  $scope.location = LocationServices.getWebAppPath();
});