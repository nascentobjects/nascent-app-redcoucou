/*
 * Copyright (c) 2015-2016, Nascent Objects Inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright 
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright 
 *    notice, this list of conditions and the following disclaimer in 
 *    the documentation and/or other materials provided with the 
 *    distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its 
 *    contributors may be used to endorse or promote products derived 
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN 
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
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
