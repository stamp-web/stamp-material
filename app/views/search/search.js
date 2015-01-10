(function(angular) {
    "use strict";

    var module = angular.module("views.search", ["stampweb.services", "ngRoute", "components.utilities.searchCritiera"]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'views/search/query-form.html',
            controller: 'QuerySearchCtrl'
        });
    }])

    module.controller('QuerySearchCtrl', function($scope,$timeout, $location, SearchCriteria, Countries, Albums) {
        var expectedServiceCount = 2;
        var loadCount = 0;

        $scope.countries = [];
        $scope.albums = [];
        $scope.searchInvalid = true;

        $scope.$watchCollection('selected', function(newVal, oldVal) {
            validateSearchValidity(newVal);
        });

        $scope.$on("querysearch-loadCount", function(evt,newVal) {
            if( newVal && +newVal >= expectedServiceCount ) {
                initializeFromCriteria();
                validateSearchValidity($scope.selected);
            }
        });

        $scope.reset = function() {
            $scope.selected = {};
            SearchCriteria.setFilter($scope.selected);
        }

        $scope.search = function() {
            SearchCriteria.setFilter( $scope.selected );
            /*   var criteria = Predicate.fromModel($scope.selected);
             if (criteria.length > 0 ) {
             var prediates = Predicate.logical(Operation.AND,criteria);
             var searchParams = $location.search();
             searchParams.$filter = prediates.serialize();
             $location.search(searchParams);
             }*/
            $location.path('/stamp-list');
        }

        var load = function(Svc, collection) {
            Svc.query().then(function(data) {
                $scope[collection] = data;
                $scope.$emit("querysearch-loadCount", ++loadCount);
            });
        };

        var initialize = function() {
            load(Countries,'countries');
            load(Albums,'albums');
        };

        var initializeFromCriteria = function() {
            var criteria = SearchCriteria.getFilter();
            if( criteria ) {
                var keys = Object.keys(criteria);
                $scope.selected = $scope.selected || { };
                for(var i = 0; i < keys.length; i++ ) {
                    switch( keys[i] ) {
                        case "countryRef":
                            if( criteria[keys[i]] ) {
                                $scope.selected.countryRef = Countries.findById( criteria[keys[i]].id );
                            }
                            break;
                        case "albumRef":
                            if( criteria[keys[i]] ) {
                                $scope.selected.albumRef = Albums.findById(  criteria[keys[i]].id );
                            }
                            break;
                        case "wantList":
                            $scope.selected.wantList =  criteria[keys[i]];
                            break;
                    }
                }
            }
        }

        var validateSearchValidity = function(model) {
            $scope.searchInvalid = !( model && (model.countryRef || model.albumRef ));
        }

        initialize();

    });
})(angular);
