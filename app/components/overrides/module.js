// module override
(function (angular) {
    "use strict";
    var originalModule = angular.module;
    angular.module = function () {
        var mod = originalModule.apply(angular, arguments);
        mod.inheritController = function (name, inheritFrom, Ctor) {
            inheritFrom = angular.isArray(inheritFrom) ? inheritFrom : [inheritFrom];
            this.controller(name, function ($scope, $controller, $injector) {
                var argsHash = {
                    $scope: $scope
                };
                var ctrl, ctrlName, mixin = {};
                for (var i = 0; i < inheritFrom.length; i++) {
                    ctrlName = inheritFrom[i];
                    ctrl = $controller(ctrlName, argsHash);
                    argsHash[ ctrlName ] = ctrl;
                    $.extend(true, mixin, ctrl);
                }
                Ctor.prototype = mixin;
                return $injector.instantiate(Ctor, {$scope: $scope});
            });
            return this;
        };

        return mod;
    };

    angular.countWatches = function () {
        var data,
            count = 0,
            test = {},
            all = document.all,
            len = all.length;

        for (var i = 0; i < len; i++) {
            data = angular.element(all[i]).data();
            if (data && data.hasOwnProperty('$scope') && data.$scope.$$watchers) {
                if (!test[ data.$scope.$id ]) {
                    test[ data.$scope.$id ] = true;
                    count += data.$scope.$$watchers.length;
                }
            }
        }

        return count;
    };

})(angular);

