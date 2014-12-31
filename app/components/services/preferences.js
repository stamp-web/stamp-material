(function (angular) {

    var services = angular.module('stampweb.services.preferences', ['core.services', 'restangular']);
    var core = angular.module('core.services');

    services.factory('Preferences', function ($rootScope, $q, Restangular, $timeout) {
        angular.injector().invoke(core.AbstractService, this, {
            $rootScope: $rootScope,
            ctx: this,
            $q: $q,
            Restangular: Restangular,
            $timeout: $timeout
        });
        this.getResourceName = function () {
            return 'preferences';
        };

        /**
         * Find the preference given the specified name.
         *
         * @param {type} name   The name to match.
         * @returns {Object} The preference from the values of null if not found.
         */
        this.findByName = function (name) {
            var len = this.values.length;
            var the_pref = null;
            for (var i = 0; i < len; i++) {
                var pref = this.values[i];
                if (pref.name === name) {
                    the_pref = pref;
                    break;
                }
            }
            return the_pref;
        };

        return this;
    });
})(angular);


