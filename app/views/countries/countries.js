(function(angular) {
    "use strict";

    var module = angular.module("views.countries", ["stampweb.services", "ngRoute", "components.utilities.history-management"]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/country-list', {
            templateUrl: 'views/countries/country-list.html',
            controller: 'CountryListCtrl'
        });
        $routeProvider.when('/country-edit', {
            templateUrl: 'views/countries/country-edit.html',
            controller: 'CountryEditCtrl'
        });

    }]);

    module.controller("CountryEditCtrl", function($scope, $location, Countries, HistoryManager) {

        $scope.countries = [];
        $scope.model;

        $scope.cancel = function() {
            var loc = HistoryManager.last();
            if( loc !== null ) {
                HistoryManager.goto(loc);
            } else {
                console.log("not found");
            }

        };

        $scope.save = function() {
            if( $scope.model ) {
                if ( $scope.model.id > 0 ) {
                    Countries.update($scope.model, { modifyImagePath : $scope.modifyStamps }).then(function() {
                        $location.path("country-list");
                    }, function(error) {
                        console.log(error);
                    });
                } else {
                    console.log("create...");
                }
            }
        }

        var params = $location.search();
        if(params.id) {
            var id = +(params.id);
            Countries.query().then(function(results) {
                $scope.countries = results;
                for(var i = 0; i < $scope.countries.length; i++ ) {
                    if( $scope.countries[i].id === id ) {
                        $scope.model = $scope.countries[i];
                        break;
                    }
                }
            }, function(error) {
                console.log(error);
            })
        }
    });

    module.controller("CountryListCtrl", function($scope, $timeout, $location, Countries) {
        $scope.countries = [];

        $scope.refresh = function() {
            Countries.query({ $orderby: 'name'}).then(function(results) {
                $scope.countries = results;
            }, function(error) {
                console.log(error);
            });
        };

        $scope.edit = function(ids) {
            var model;
            var id = (ids && angular.isArray(ids)) ? ids[0] : -1;
            for(var i = 0; i < $scope.countries.length; i++ ) {
                if( $scope.countries[i].id === +id ) {
                    model = $scope.countries[i];
                    break;
                }
            }
            if( model ) {
                $location.search("id", "" + model.id);
                $location.path("country-edit");
            }
        };

        $timeout(function() {
            $scope.refresh();
        },50,false);

    });
})(angular);