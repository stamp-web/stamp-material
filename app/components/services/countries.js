(function(angular) {
    "use strict";

    var services = angular.module('stampweb.services.countries', ['core.services', 'restangular']);
    var core = angular.module('core.services');

    services.factory('Countries', function ($rootScope, $q, Restangular, $timeout) {
        angular.injector().invoke(core.AbstractService, this, {
            $rootScope: $rootScope,
            ctx: this,
            $q: $q,
            Restangular: Restangular,
            $timeout: $timeout
        });
        this.getResourceName = function () {
            return 'countries';
        };

        return this;
    });

})(angular);