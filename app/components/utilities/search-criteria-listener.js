(function(angular) {
    "use strict";

    var module = angular.module("components.utilities.searchCritiera", ['LocalStorageModule']);

    module.factory('SearchCriteria', function(localStorageService, $timeout, $rootScope) {
        var queryParams = undefined;
        var checkedLocalStorage = false;
        this.getFilter = function() {
            if( !queryParams && !checkedLocalStorage && localStorageService.isSupported ) {
                checkedLocalStorage = true;
                queryParams = localStorageService.get('$filter');
            }
            return queryParams;
        };

        this.setFilter = function(criteria) {
            queryParams = criteria;
            if( localStorageService.isSupported) {
                localStorageService.set('$filter', criteria);
            }
            $rootScope.$broadcast("SearchCriteria-filterChanged", criteria);
        }
        return this;
    });

    module.directive("searchCriteriaListener", function($location, $timeout, SearchCriteria) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                if( !attrs.triggerEvent || attrs.triggerEvent === '' ) {
                    throw new Error("a trigger-event is required by the search-criteria-listener element.")
                }
                var filter = SearchCriteria.getFilter();

                var filterChanged = function(filter) {
                    if( filter ) {
                        var criteria = Predicate.fromModel(filter);
                        var predicate;
                        if (criteria.length > 0 ) {
                            predicate = Predicate.logical(Operation.AND,criteria);
                            var queryParams = {
                                $filter: predicate.serialize()
                            };
                            $timeout(function() {
                                scope.$broadcast(attrs.triggerEvent,queryParams);
                            },0, false);
                        }
                    }
                };

                if(filter) {
                    filterChanged(filter);
                }

                scope.$on("SearchCriteria-filterChanged", function(evt,criteria) {
                   filterChanged(filter);
                })

                /*var params = $location.search();
                if( params.$filter ) {
                    var queryParams = {
                        $filter: params.$filter
                    };
                }*/
            }
        }
    });
})(angular);
