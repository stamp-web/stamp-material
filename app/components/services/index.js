(function(angular) {
    angular.module('stampweb.services', [
        'core.services',
        'stampweb.services.preferences',
        'stampweb.services.countries',
        'stampweb.services.stamps'
    ]);
})(angular);