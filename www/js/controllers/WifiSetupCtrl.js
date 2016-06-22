/*
 * @author Andrew Robberts <andrew@nascentobjects.com>
 * @copyright 2015-2016 Nascent Objects Inc. All rights reserved.
 */
app.controller('WifiSetupCtrl', function ($scope, $stateParams, ionicMaterialInk, NascentBLE, $ionicLoading) {
    ionicMaterialInk.displayEffect();

    $scope.getWifiStatus = function() {
        NascentBLE.sendEvent('needwifi');
        /*
        $ionicLoading.show({
            content: 'Checking Wifi Status',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        */
    };

    $scope.$on('$ionicView.afterEnter', function() {
        $scope.getWifiStatus();
    });

    $scope.settings = {
        wifiQuality: 0,
        wifiAccessPoint: '',
        wifiPassword: '',
        connectedAccessPoint: '',
    };

    NascentBLE.on('wificonn', function(connInfo) {
        $ionicLoading.hide();
        if ($scope.settings.wifiAccessPoint === '') {
            $scope.settings.wifiAccessPoint = connInfo.ssid;
        }
        $scope.settings.connectedAccessPoint = connInfo.ssid;
        $scope.settings.wifiQuality = connInfo.quality;
        $scope.settings.connectedIP = connInfo.ip;
        $scope.$apply();
    });

    $scope.connectWireless = function() {
        NascentBLE.sendEvent('connect_wifi', {
            ssid: $scope.settings.wifiAccessPoint,
            password: $scope.settings.wifiPassword
        });
        $scope.hideConnectButton();
        $scope.getWifiStatus();
    };

    $scope.hasConnectButton = false;

    $scope.showConnectButton = function() {
        $scope.hasConnectButton = true;
    };

    $scope.hideConnectButton = function() {
        $scope.hasConnectButton = false;
    };
});
