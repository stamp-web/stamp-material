(function(angular) {
    "use strict";

    var services = angular.module('stampweb.services.albums', ['core.services', 'restangular']);
    var core = angular.module('core.services');

    services.factory('Albums', function ($rootScope, $q, Restangular, $timeout) {
        angular.injector().invoke(core.AbstractService, this, {
            $rootScope: $rootScope,
            ctx: this,
            $q: $q,
            Restangular: Restangular,
            $timeout: $timeout
        });
        this.getResourceName = function () {
            return 'albums';
        };

        return this;
    });

})(angular);