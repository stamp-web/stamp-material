(function (angular, log4javascript) {
    'use strict';
    var services = angular.module('stampweb.services.stamps', ['restangular', 'core.services']);
    var core = angular.module('core.services');
    var logger = log4javascript.getLogger('stampweb.stamp.services');
    services.factory('StampsRestangular', function (Restangular) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setRequestInterceptor(function (element, operation, route, url) {
                if (element) {
                    delete element.type;
                    if (element.activeCatalogueNumber) {
                        delete element.activeCatalogueNumber;
                    }
                    if (operation === 'post' || operation === 'put') {
                        if (element.stampOwnerships && element.stampOwnerships.length > 0) {
                            var d;
                            if (element.stampOwnerships[0].purchased && element.stampOwnerships[0].purchased !== '') {
                                d = new Date(element.stampOwnerships[0].purchased).toISOString();
                                element.stampOwnerships[0].purchased = d;
                            }

                        }
                    }
                }
                return element;
            });
        });
    });

    services.factory('Stamps', function ($rootScope, $q, $window, StampsRestangular, $timeout, $location, $http) {
        this.parent = angular.injector().invoke(core.AbstractService, this, {
            $rootScope: $rootScope,
            ctx: this,
            $q: $q,
            Restangular: StampsRestangular,
            $timeout: $timeout,
            $location: $location,
            $http: $http
        });
        this.TOTAL_REQUESTS = 4; // total number of concurrent requests allowed

        this.executeReport = function (params) {
            if (typeof params._dc === 'undefined') {
                params._dc = 'report-' + (new Date()).getTime();
            }
            return StampsRestangular.all("reports").getList(params);
        };

        /** MOVE TO AN EXTERNAL SERVICE
        /**
         * Generate a report from the stamps resource using the provided filter and
         * set the current window location.  Since the response should be PDF this will
         * be handled as a download.
         *
         * @param {type} params
         * @returns {undefined}
         */
        this.generateReportAsPdf = function (params) {
            $window.location.href = StampsRestangular.all(this.getResourceName()).getRestangularUrl() +
                '/report?' + $.param(params);
        };
        this.updateAll = function (stamps) {
            var processed = [];
            var deferred = $q.defer();
            var that = this;
            var t = (new Date()).getTime();
            if (stamps.length > 0) {
                // likely need some form of chunking here (overloading the requests)
                var processGroup = 0;
                $rootScope.$emit('progress', {
                    max: stamps.length,
                    value: 0,
                    operation: 'updateAll'
                });
                var process = function (stamp) {
                    if (processGroup > that.TOTAL_REQUESTS) {
                        $timeout(function () {
                            process(stamp);
                        }, 25);
                    } else {
                        processGroup++;
                        stamp.put().then(function (result) {
                            processed.push(result);
                            $rootScope.$emit('progress', {
                                value: processed.length,
                                operation: 'updateAll'
                            });
                            processGroup--;
                            if (processed.length === stamps.length) {
                                // refresh grid?
                                $rootScope.$emit('progress-finished', {
                                    operation: 'updateAll'
                                });
                                $rootScope.$broadcast('serviceUpdate', processed);
                                deferred.resolve(processed);
                                logger.info("Total time to process " + processed.length + " stamps: " + ((new Date()).getTime() - t) + "ms");
                            }
                        },
                            function (failure) {
                                deferred.reject(failure);
                            });
                    }
                };
                // Need to invoke after the event loop
                $timeout(function () {
                    angular.forEach(stamps, function (stamp) {
                        process(stamp);
                    });
                });
            } else {
                deferred.resolve(processed);
            }
            return deferred.promise;
        };
        this.exists = function (countryRef, catalogueRef, number) {
            var params = [];
            params.push(new Predicate({
                subject: 'countryRef',
                value: +countryRef
            }));
            params.push(new Predicate({
                subject: 'catalogueRef',
                value: +catalogueRef
            }));
            params.push(new Predicate({
                subject: 'number',
                value: number
            }));
            var p = Predicate.logical(Operation.AND, params);
            return StampsRestangular.all(this.getResourceName()).getList({
                $filter: p.serialize(),
                _dc: 'exists-' + (new Date()).getTime()
            }).then(function (results) {
                if (results.total > 0) {
                    return results;
                }
                return null;
            });
        };
        this.getResourceName = function () {
            return 'stamps';
        };
        return this;
    });
})(angular, log4javascript);