(function (angular) {

    "use strict";

    var module = angular.module("views.application", ["ngMaterial"])
        .controller("HeaderCtrl", function ($scope, $location, $timeout, $mdSidenav, $rootScope) {
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

    })
        .controller('FooterCtrl', function($scope, $rootScope, $timeout) {
            $scope.loading = false;

            $rootScope.$on('event: status', function(evt,data) {
                if( data && typeof data.loading !== 'undefined' ) {
                    $scope.loading = data.loading;
                }
            })
        })



})(angular);