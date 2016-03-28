app.controller('ModulesCtrl', function ($scope, $stateParams, ionicMaterialInk, Settings, NascentBLE, $rootScope, $location) {
    ionicMaterialInk.displayEffect();

    $scope.moduleName = '';

    $scope.hasSpeaker = function() {
        return $scope.moduleName === 'speaker';
    };

    $scope.hasEInk = function() {
        return $scope.moduleName === 'eink';
    };

    $scope.$on('$ionicView.afterEnter', function() {
        NascentBLE.sendEvent('querymodule');
        console.log('Sending Query For Enter');
    });

    NascentBLE.on('module', function(moduleName) {
        $rootScope.musicEnabled = (moduleName === 'speaker');
        $rootScope.bikeEnabled = (moduleName === 'eink');
        $scope.moduleName = moduleName;

        $location.path('#/app/modules');
        $scope.$apply();
    });

});
