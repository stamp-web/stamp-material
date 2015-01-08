(function(angular) {

    var module = angular.module("views.stamps", ["ngRoute", "stampweb.services"]);


    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/stamp-list', {
            templateUrl: 'views/stamps/stamp-list.html',
            controller: 'StampListCtrl'
        });
    }])

    module.controller('StampListCtrl', function($scope,$location,$timeout,Stamps) {

        $scope.stamps = [];

        $scope.$on("search-stamps", function(evt, criteria) {
            Stamps.query(criteria).then(function(results) {
                $scope.stamps = results;
            }, function(error) {
                console.log(error);
            });
        });


    });

})(angular);