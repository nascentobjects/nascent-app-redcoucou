app.controller('WeatherCtrl', function ($scope, $stateParams, ionicMaterialInk, NascentBLE, $ionicLoading) {
    ionicMaterialInk.displayEffect();

    $scope.$on('$ionicView.afterEnter', function() {
        NascentBLE.sendEvent('goweather');
        NascentBLE.sendEvent('w_getsettings');
    });

    $scope.settings = {
        unitsInF: true,
    };

    $scope.updateSettings = function() {
        console.log('Setting Weather: ' + JSON.stringify($scope.settings));
        NascentBLE.sendEvent('w_setsettings', $scope.settings);
    };

    NascentBLE.on('w_settings', function(settings) {
        $scope.settings = settings;
        $scope.$apply();
    });
});
