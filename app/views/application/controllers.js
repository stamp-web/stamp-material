(function(angular) {

    "use strict";

    var module = angular.module("views.application", []);

    module.controller("HeaderCtrl", function($scope, $location) {
         $scope.goto = function(path, search) {
             if( search ) {
                 $location.search(search);
             }
             $location.path(path);
         }
    });
})(angular);