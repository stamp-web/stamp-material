(function(angular) {
    angular.module('stampweb.services', [
        'core.services',
        'stampweb.services.preferences',
        'stampweb.services.albums',
        'stampweb.services.countries',
        'stampweb.services.stamp-collections',
        'stampweb.services.stamps'
    ]);
})(angular);