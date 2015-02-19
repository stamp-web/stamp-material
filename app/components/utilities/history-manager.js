(function(angular) {
    "use strict";

    var module = angular.module("components.utilities.history-management",[]);

    module.factory('HistoryManager', function($location) {
        var visited = [];

        this.add = function( url ) {
            visited.push(url);
        }

        this.clear = function() {
            visited = [];
        }

        this.goto = function(visitor) {
            $location.search(visitor.search);
            $location.path(visitor.path);
        }

        this.last = function() {
            if( visited.length > 0 ) {
                return visited.pop();
            } else {
                return null;
            }
        }

        return this;
    });

    module.run(function($rootScope, $location, HistoryManager) {
       $rootScope.$on('$locationChangeSuccess', function(e, to, from) {
           console.log("bing");
           if( from.indexOf('#!') >= 0 ) {
               var path = from.substring(from.indexOf('#!')+2);
               var search = "";
               if( path.indexOf('?') >= 0 ) {
                   search = path.substring(path.indexOf('?')+1);
                   path= path.substring(0,path.indexOf('?'));
               }
               HistoryManager.add({
                   path: path,
                   search: search
               });
           }

       })
    });
})(angular);