/*
 * @author Andrew Robberts <andrew@nascentobjects.com>
 * @copyright 2015-2016 Nascent Objects Inc. All rights reserved.
 */
app.controller('AlexaCtrl', function ($scope, $stateParams, ionicMaterialInk, NascentBLE, $rootScope, $location, $ionicLoading) {
    ionicMaterialInk.displayEffect();

    $scope.talking = false;

    $scope.$on('$ionicView.afterEnter', function() {
    });

    $scope.alexaTalk = function() {
        NascentBLE.sendEvent('alexa_talk');
        $ionicLoading.show({
            content: 'Connecting to Alexa',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    $scope.alexaStop = function() {
        NascentBLE.sendEvent('alexa_stop');
    };

    NascentBLE.on('alexa_start', function() {
        $ionicLoading.hide();
        $scope.talking = true;
        $scope.$apply();
    });

    NascentBLE.on('alexa_done', function() {
        $ionicLoading.hide();
        $scope.talking = false;
        $scope.$apply();
    });

    NascentBLE.on('wificonn', function(connInfo) {
        if (settings.wifiQuality <= 0) {
            $location.path('#/app/wifisetup');
        }
    });
});
