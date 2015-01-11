(function (angular) {

    "use strict";

    var module = angular.module("views.application", ["ngMaterial"]);

    module.controller("HeaderCtrl", function ($scope, $location, $timeout, $mdSidenav) {
        var menuComponentId = 'left-nav';

        $scope.goto = function (path, search) {
            if (search) {
                $location.search(search);
            }
            $location.path(path);
            $timeout(function () {
                $mdSidenav(menuComponentId).close();
            }, 250, false);

        };

        $scope.toggleMenu = function () {
            $mdSidenav(menuComponentId).toggle();
        };

    });

})(angular);