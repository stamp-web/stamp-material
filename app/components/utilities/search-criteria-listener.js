(function(angular) {
    "use strict";

    var module = angular.module("components.utilities.searchCritiera", []);

    module.directive("searchCriteriaListener", function($location, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                if( !attrs.triggerEvent || attrs.triggerEvent === '' ) {
                    throw new Error("a trigger-event is required by the search-criteria-listener element.")
                }
                var params = $location.search();
                if( params.$filter ) {
                    var queryParams = {
                        $filter: params.$filter
                    };
                    $timeout(function() {
                        scope.$broadcast(attrs.triggerEvent,queryParams);
                    }, 125, false);

                }

            }
        }
    });
})(angular);
