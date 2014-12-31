'use strict';

angular.module('myApp.view1', ['ngRoute','core.services'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/views', {
    templateUrl: 'views/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope,LocationServices) {
      console.log(LocationServices);
  $scope.location = LocationServices.getWebAppPath();
});