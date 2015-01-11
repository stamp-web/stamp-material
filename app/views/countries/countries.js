(function(angular) {
    "use strict";

    var module = angular.module("views.countries", ["stampweb.services", "ngRoute"]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/country-list', {
            templateUrl: 'views/countries/country-list.html',
            controller: 'CountryListCtrl'
        });
    }])

    module.controller("CountryListCtrl", function($scope, $timeout, Countries) {
        $scope.countries = [];

        $scope.refresh = function() {
            Countries.query({ $orderby: 'name'}).then(function(results) {
                $scope.countries = results;
            }, function(error) {
                console.log(error);
            });
        };


        $timeout(function() {
            $scope.refresh();
        },50,false);

    });
})(angular);