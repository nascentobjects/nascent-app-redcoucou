app.controller('ModulesCtrl', function ($scope, $stateParams, ionicMaterialInk, Settings, NascentBLE, $rootScope, $location) {
    ionicMaterialInk.displayEffect();

    $scope.moduleName1 = '';
    $scope.moduleName2 = '';

    $scope.hasEInk = function () {
        return $scope.moduleName1 === 'eink';
    };

    $scope.hasSpeaker1 = function () {
        return $scope.moduleName1 === 'speaker';
    };

    $scope.hasSpeaker2 = function () {
        return $scope.moduleName2 === 'speaker';
    };

    $scope.hasFlashLight1 = function () {
        return $scope.moduleName1 === 'flashlight';
    };

    $scope.hasFlashLight2 = function () {
        return $scope.moduleName2 === 'flashlight';
    };

    $scope.$on('$ionicView.afterEnter', function() {
        NascentBLE.sendEvent('querymodule1');   //???send command to Hermes
        NascentBLE.sendEvent('querymodule2');   //???send command to Hermes
        console.log('Sending Query For Enter');
    });

    NascentBLE.on('module1', function(moduleName) {
        $scope.moduleName1 = moduleName;

        $rootScope.musicEnabled1 = (moduleName === 'speaker');
        $rootScope.bikeEnabled1 = (moduleName === 'eink');
        $rootScope.flashlightEnabled1 = (moduleName === 'flashlight');

        $location.path('#/app/modules');
        $scope.$apply();
    });

    NascentBLE.on('module2', function (moduleName) {
        $scope.moduleName2 = moduleName;

        $rootScope.musicEnabled2 = (moduleName === 'speaker');
        $rootScope.flashlightEnabled2 = (moduleName === 'flashlight');

        $location.path('#/app/modules');
        $scope.$apply();
    });
});
