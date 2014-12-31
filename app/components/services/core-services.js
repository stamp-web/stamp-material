(function (_, angular, log4javascript) {
    'use strict';
    var logger = log4javascript.getLogger('core.services');
    var services = angular.module('core.services', ['restangular']);

    services.factory('LocationServices', function ($location) {

        var cacheMap = {
            webappPath: null
        };
        this.$get = angular.noop;
        this.getWebAppPath = function () {
            if (cacheMap.webappPath === null) {
                if ($location.search().webapp !== undefined) {
                    cacheMap.webappPath = $location.search().webapp;
                } else {
                    var webapp;
                    var path = $location.absUrl();
                    if (path.indexOf('#') > 0) {
                        path = path.substring(0, path.indexOf('#'));
                    }
                    if (path.indexOf('?') > 0) {
                        webapp = path.substring(path.indexOf('?')+1);
                        var props = webapp.parseQueryString();
                        if( props.webapp ) {
                            cacheMap.webappPath = props.webapp;
                        }
                        path = path.substring(0, path.indexOf('?'));
                    }
                    if( cacheMap.webappPath === null ) {
                        var baseHref = $location.protocol() + '//' + $location.host();
                        if ($location.port() !== 80 && ($location.protocol() !== 'https' && $location.port() !== 443)) {
                            baseHref += ':' + $location.port() + '/';
                        }
                        path = path.substring(baseHref.length + 1);
                        if (path.lastIndexOf('/') === path.length - 1) {
                            path = path.substring(0, path.lastIndexOf('/'));
                        } else if (path.indexOf('/') === 0) {
                            path = path.substring(1);
                        }
                        cacheMap.webappPath = path;
                    }
                }
            }
            return cacheMap.webappPath;
        };
        return this;
    });

    services.AbstractService = function ($rootScope, ctx, $q, Restangular, $timeout) {

        ctx.values = [];
        ctx.total = 0;
        ctx.params = {};
        ctx.lastCacheHit = {
            id: -1,
            value: undefined
        };
        /**
         * Return a parameters object only containing the parameters which are monitored
         * for equality.  These include:
         * <ul>
         * <li>$filter</li>
         * <li>$top</li>
         * <li>$orderby</li>
         * <li>$skip</li>
         * </ul>
         *
         * @param {type} params The object to filter
         * @returns {p} the new object containing only the filtered parameters
         */
        ctx.monitoredParams = function (params) {
            var p = {};
            var reservedKeys = ['$filter', '$top', '$orderby', '$skip'];
            angular.forEach(params, function (value, key) {
                if (_.contains(reservedKeys, key)) {
                    p[key] = value;
                }
            });
            return p;
        };
        /**
         * Determine whether to use the cached result for query.  A cached result will be
         * used if the following is true:
         * <ul>
         * <li>The current results have at least one value.</li>
         * <li>The monitored parameters are matching for the existing and new params.</li>
         * <li>The existing params had a dynamic cache directive, but the new params does not.</li>
         * <li>The same dynamic cache directive exists on both the new params and existing params</li>
         *
         * @param {Object} params - the new parameters
         * @param {Object} that - the current service instance
         * @return Whether to use the cache result or not.
         */
        ctx.useCachedResult = function (params, that) {
            var the_params = that.monitoredParams(that.params);
            var cacheAndNew = function (params, a_params) {
                return (typeof params._dc === 'undefined' && typeof a_params._dc !== 'undefined');
            };
            var sameCache = function (params, a_params) {
                return params._dc === a_params._dc;
            };
            if (that.values.length > 0 && _.isEqual(that.monitoredParams(params), the_params) &&
                ((that.params === undefined && params === undefined) || (that.params !== undefined &&
                    params !== undefined && (cacheAndNew(params, that.params) || sameCache(params, that.params))))) {
                return true;
            }
            return false;
        };
        ctx.query = function (params) {
            var deferred, that = ctx;
            if (ctx.useCachedResult(params, that)) {
                logger.debug("using the cached result for " + ctx.getResourceName());
                deferred = $q.defer();
                deferred.resolve(that.values);
                return deferred.promise;
            }
            var _t = (new Date()).getTime();
            $rootScope.$emit('event: status', {
                msg: 'Loading {0}...'.format(ctx.getResourceName()),
                type: ctx.getResourceName(),
                loading: true
            });
            return Restangular.all(ctx.getResourceName()).getList(params).then(function (results) {
                that.total = results.total;
                that.values = (results.length >= 1) ? results : [];
                that.params = angular.copy(params);
                ctx.lastCacheHit.id = -1;
                $rootScope.$emit('event: status', {
                    msg: 'Loading complete ({0} items, {1}ms)'.format(that.values.length, ((new Date()).getTime() - _t)),
                    type: ctx.getResourceName(),
                    loading: false
                });
                return that.values;
            }, function (error) {
                $rootScope.$emit('event: status', {
                    msg: 'Error retrieving ' + ctx.getResourceName(),
                    type: ctx.getResourceName(),
                    status: error.status,
                    error: true,
                    loading: false
                });
            });
        };
        ctx.getLastParameters = function () {
            return ctx.params;
        };
        ctx.refresh = function (params) {
            var that = ctx,
                query_params = angular.copy((!params) ? {} : params);
            that.values = [];
            query_params._dc = (new Date()).getTime();
            return that.query(query_params);
        };
        ctx.indexOf = function (id) {
            var len, i, index;
            index = -1;
            len = ctx.values.length;
            if (len > 0) {
                for (i = 0; i < len; i += 1) {
                    if (ctx.values[i].id === id) {
                        index = i;
                        break;
                    }
                }
            }
            return index;
        };
        ctx.findById = function (id) {
            if (ctx.lastCacheHit.id === id) {
                return ctx.lastCacheHit.value;
            }
            var index = ctx.indexOf(id);
            if (ctx.values.length > 0 && index >= 0) {
                ctx.lastCacheHit.id = id;
                ctx.lastCacheHit.value = ctx.values[index];
                return ctx.values[index];
            }
            return null;
        };
        ctx.copy = function (item) {
            return Restangular.copy(item);
        };
        ctx.remove = function (id) {
            var that = ctx;
            return that.query(ctx.getLastParameters()).then(function (results) {
                var index = that.indexOf(id);
                if (index >= 0) {
                    ctx.lastCacheHit.id = -1;
                    var item = results[index];
                    item.remove();
                    return true;
                }
                return false;
            });
        };
        ctx.update = function (item) {
            var that = ctx;
            if (typeof item.put !== 'undefined') {
                return item.put().then(function (result) {
                    ctx.lastCacheHit.id = -1;
                    that.query(ctx.getLastParameters()).then(function (results) {
                        var index = that.indexOf(result.id);
                        if (index >= 0 && ctx.values !== null) {
                            ctx.values.splice(index, 1);
                            $timeout(function () {
                                if (ctx.values.length > index) {
                                    ctx.values.splice(index, 0, result);
                                } else {
                                    ctx.values.push(result);
                                }
                                var val = {
                                    data: result,
                                    svc: ctx.getResourceName()
                                };
                                $rootScope.$broadcast('serviceUpdate', val);
                            }, 25);
                        }
                    });
                    return result;
                });
            } else {
                throw 'Can not call put() on non-Restangular object.';
            }
        };
        ctx.create = function (item) {
            var that = ctx;
            return Restangular.all(ctx.getResourceName()).post(item).then(function (result) {
                that.query(ctx.getLastParameters()).then(function (results) {
                    results.push(result);
                });
                return result;
            });
        };
        ctx.getResourceName = function () {
            throw "getResourceName() must be implemented";
        };
        return this;
    };
})(_, angular, log4javascript);