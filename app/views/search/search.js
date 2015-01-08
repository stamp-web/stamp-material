(function(angular) {
    "use strict";

    var module = angular.module("views.search", ["stampweb.services", "ngRoute"]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'views/search/query-form.html',
            controller: 'QuerySearchCtrl'
        });
    }])

    module.controller('QuerySearchCtrl', function($scope,Countries,$timeout, $location) {

        $scope.countries = [];

        var loadCountries = function() {
            Countries.query().then(function(data) {
                $scope.countries = data;
            });
        };

        $scope.deferLoad = function(resource) {
            switch(resource) {
                case 'countries':
                    loadCountries();
            }
        }

        $scope.search = function() {
            var searchParams = $location.search();
            searchParams.$filter = $scope.selectedCountry ? '(countryRef eq ' + $scope.selectedCountry.id + ')' : '(wantList eq 0)';
            $location.search(searchParams);
            $location.path('/stamp-list');
        }

    });
})(angular);
