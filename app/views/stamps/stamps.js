(function(angular, _) {

    "use strict";

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

    module.controller("StampEditCtrl", function($scope, $timeout, Countries, Albums, Catalogues, Preferences, Sellers, Stamps) {
        $scope.countries = [];
        $scope.catalogues = [];
        $scope.albums = [];
        $scope.sellers = [];

        var loadCount = 0;
        var activeCn, owner;

        $scope.model = {
            id: 0,
            catalogueNumbers: [],
            wantList: false
        };

        $scope.save = function() {
            if( $scope.model.id > 0 ) {
                Stamps.update($scope.model);
            } else {
                var result = Stamps.create($scope.model);
                console.log(result);
            }
        };

        $scope.cancel = function() {

        };

        var load = function(Svc, collection) {
            Svc.query({
                $orderby: 'name'
            }).then(function(data) {
                $scope[collection] = data;
            });
        };

        var initialize = function() {
            load(Countries,'countries');
            load(Albums,'albums');
            load(Catalogues,'catalogues');
            load(Sellers,'sellers');
        };

        var setDefaults = function () {
            if( !$scope.model.id || $scope.model.id <= 0 ) {
                Preferences.query().then(function (prefs) {
                    var prefMap = [ {
                        keys: [ 'countryRef']
                    }, {
                        keys: [ 'catalogueRef', 'condition' ]
                    }];
                    if( $scope.model.wantList === false ) {
                        prefMap.push({
                            keys: [ 'albumRef', 'sellerRef', 'grade', 'condition']
                        });
                    }
                    _.each( prefMap, function(el, index) {
                        var model;
                        switch (index) {
                            case 0:
                                model = $scope.model;
                                break;
                            case 1:
                                model = $scope.getCatalogueNumber();
                                break;
                            case 2:
                                model = $scope.getStampOwnership();
                                break;
                        }
                        $timeout(function() {
                            _.each(el.keys, function( elm ) {
                                var p = _.findWhere(prefs, { name: elm});
                                model[elm] = (p) ? +p.value: -1;
                            })
                        },0);
                    });
                });
            }
        }


        $scope.calculateImagePath = function () {
            var num = $scope.getCatalogueNumber();
            if ($scope.getStampOwnership() && +$scope.model.countryRef > 0 ) {
                var country = Countries.findById(+$scope.model.countryRef);
                var path = ((country !== null) ? country.name + '/' : '') +
                    ((typeof num.number !== 'undefined' && num.number !== '') ? (num.number + '.jpg') : '');
                $scope.getStampOwnership().img = path;
            }
        };

        var configureWatches = function() {

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
                if($scope.model.stampOwnerships && $scope.model.stampOwnerships.length > 0 ) {
                    owner = $scope.model.stampOwnerships[0];
                } else {
                    $scope.model.stampOwnerships = [{}];
                    owner = $scope.model.stampOwnerships[0];
                }
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
        setDefaults();
        configureWatches();
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

})(angular, _);