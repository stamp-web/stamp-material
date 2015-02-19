'use strict';

// Declare app level module which depends on views, and components
angular.module('stamp-web', [
    'ngRoute',
    'restangular',
    'LocalStorageModule',
    'stampweb.services',
    'components.utilities',
    'ng-scrolling-table',
    'views.home',
    'views.search',
    'views.stamps',
    'views.countries',
    'views.application',
    'ngMaterial',
    'myApp.version'
]).
    config(function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(false);
        $locationProvider.hashPrefix("!");
        $routeProvider.otherwise({redirectTo: '/home'});
    }).
    config(function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('stamp-web-material');
    }).
    config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('light-blue');
    }).

        config(function (RestangularProvider) {
        RestangularProvider.setDefaultHttpFields({
            //    cache: true
        });
        RestangularProvider.setRequestInterceptor(function (elem, operation) {
            if (operation === "remove") {
                return undefined;
            }
            return elem;
        });

        RestangularProvider.setResponseInterceptor(function (response, operation, what, url) {
            var newResponse, tokens, len, i;
            if (what === null) {
                tokens = url.split('/');
                len = tokens.length;
                for (i = 0; i < len; i += 1) {
                    if (tokens[i] === 'rest' && i + 1 < len) {
                        what = tokens[i + 1];
                        break;
                    }
                }
            }
            if (operation === "getList" && response[what] !== undefined) {
                newResponse = response[what];
                if (typeof response.total !== 'undefined') {
                    newResponse.total = response.total;
                }
            } else if (operation === "getList" && !angular.isArray(response)) {
                newResponse = [];
                newResponse.push(response);
            } else {
                newResponse = response;
            }
            return newResponse;
        });
    }).
run(function (Restangular, LocationServices) {
    var webapp = LocationServices.getWebAppPath();
    Restangular.setBaseUrl('/' + webapp + '/rest');
});
