(function(angular) {
    "use strict";

    var module = angular.module("views.search", ["stampweb.services", "ngRoute", "components.utilities.searchCritiera"]);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'views/search/query-form.html',
            controller: 'QuerySearchCtrl'
        });
    }])

    module.controller('QuerySearchCtrl', function($scope,$timeout, $location, SearchCriteria, Countries, Albums, StampCollections) {
        var expectedServiceCount = 3;
        var loadCount = 0;

        $scope.countries = [];
        $scope.albums = [];
        $scope.stampCollections = [];
        $scope.searchInvalid = true;

        $scope.selected = {
            countryRef: undefined,
            albumRef: undefined,
            stampCollectionRef: undefined
        };

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

        $scope.getName = function (collection, id) {
            var name = '';
            if (id && id > 0) {
                var col;
                switch (collection) {
                    case 'countries':
                        col = $scope.countries;
                        break;
                    case 'albums':
                        col = $scope.albums;
                        break;
                    case 'stampCollections':
                        col = $scope.stampCollections;
                        break;
                }
                if (col) {
                    var len = col.length;
                    for (var i = 0; i < len; i++) {
                        if (col[i].id === +id) {
                            name = col[i].name;
                            break;
                        }
                    }
                }
            }
            return name;
        }

        var load = function(Svc, collection) {
            Svc.query({
                $orderby: 'name'
            }).then(function(data) {
                $scope[collection] = data;
                $scope.$emit("querysearch-loadCount", ++loadCount);
            });
        };

        var initialize = function() {
            load(Countries,'countries');
            load(Albums,'albums');
            load(StampCollections,'stampCollections');
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
                                console.log("countryRef");
                                $scope.selected.countryRef = criteria[keys[i]].id;
                            }
                            break;
                        case "albumRef":
                            if( criteria[keys[i]] ) {
                                $scope.selected.albumRef = criteria[keys[i]].id;
                            }
                            break;
                        case "stampCollectionRef":
                            if( criteria[keys[i]] ) {
                                $scope.selected.stampCollectionRef = criteria[keys[i]].id;
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
