(function(angular) {
    "use strict";

    var services = angular.module('stampweb.services.stamp-collections', ['core.services', 'restangular']);
    var core = angular.module('core.services');

    services.factory('StampCollections', function ($rootScope, $q, Restangular, $timeout, $location, $http) {
        angular.injector().invoke(core.AbstractService, this, {
            $rootScope: $rootScope,
            ctx: this,
            $q: $q,
            Restangular: Restangular,
            $timeout: $timeout,
            $location: $location,
            $http: $http
        });
        this.getResourceName = function () {
            return 'stampCollections';
        };

        return this;
    });

})(angular);