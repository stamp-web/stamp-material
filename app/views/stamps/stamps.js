(function(angular) {

    var module = angular.module("views.stamps", ["ngRoute", "stampweb.services"]);


    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/stamp-list', {
            templateUrl: 'views/stamps/stamp-list.html',
            controller: 'StampListCtrl'
        });
        $routeProvider.when('/edit-stamp', {
            templateUrl: 'views/stamps/stamp-edit.html',
            controller: 'StampEditCtrl'
        });
    }])

    module.controller("StampEditCtrl", function($scope, Countries, Albums, Catalogues, Sellers) {
        $scope.countries = [];
        $scope.catalogues = [];
        $scope.albums = [];
        $scope.sellers = [];

        var loadCount = 0;
        var activeCn, owner;

        $scope.model = {
            catalogueNumbers: [],
            wantList: true
        };

        var load = function(Svc, collection) {
            Svc.query({
                $orderby: 'name'
            }).then(function(data) {
                $scope[collection] = data;
              //  $scope.$emit("querysearch-loadCount", ++loadCount);
            });
        };

        var initialize = function() {
            load(Countries,'countries');
            load(Albums,'albums');
            load(Catalogues,'catalogues');
            load(Sellers,'sellers');
        };

        var numWatchFn = function (exp) {
            return $scope.$watch(exp, function (newVal, oldVal) {
                if (newVal > 0) {
                    var catalogue = Catalogues.findById(+newVal);
                    if (catalogue !== null) {
                        $scope.code = catalogue.code;
                        return;
                    }
                }
                $scope.code = undefined;
            });
        };

        $scope.getStampOwnership = function() {
            if( !owner ) {
                owner = ( $scope.model.stampOwnerships && $scope.model.stampOwnerships.length > 0 ) ? $scope.model.stampOwnerships[0] : { };
            }
            return owner;
        }

        $scope.getCatalogueNumber = function() {
            if( !activeCn) {
                var len = $scope.model.catalogueNumbers.length;
                for( var i = 0; i < len; i++ ) {
                    if( $scope.model.catalogueNumbers[i].active === true ) {
                        activeCn = $scope.model.catalogueNumbers[i];
                        numWatchFn('model.catalogueNumbers[' + i + '].catalogueRef');
                        break;
                    }

                }
                if( !activeCn) {
                    activeCn = {
                        active: true
                    };
                    $scope.model.catalogueNumbers.push(activeCn);
                    numWatchFn('model.catalogueNumbers[0].catalogueRef');
                }
            }
            return activeCn;
        }

        initialize();

    });

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