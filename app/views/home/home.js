(function() {
    "use strict";

    var module = angular.module("views.home", ['ngRoute']);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'views/home/home.html',
            controller: 'MainCtrl'
        });
    }]);

    module.controller('MainCtrl', function($scope,LocationServices, Preferences) {
            console.log(LocationServices);
            Preferences.query().then(function(data) {
                console.log(data);
            })
            $scope.location = LocationServices.getWebAppPath();
        });
})();