/*
 * @author Andrew Robberts <andrew@nascentobjects.com>
 * @copyright 2015-2016 Nascent Objects Inc. All rights reserved.
 */
app.controller('AppCtrl', function ($scope, $ionicModal, $ionicPopover, $timeout, $location, NascentBLE) {
    // Form data for the login modal
    $scope.loginData = {};

    $scope.isOnPage = function(pageName) {
        try {
            var url = $location.path();
            var splits = url.split('/');
            var currPageName = splits[splits.length-1];
            return pageName === currPageName;
        } catch (e) {
            return false;
        }
    };

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }

    $scope.settings = {
        volume: 100 
    };
    $scope.savedVolume = 100;

    $scope.changeVolume = function() {
        console.log('Volume: ', $scope.settings.volume);
        if (Math.abs($scope.savedVolume - $scope.settings.volume) > 10) {
            NascentBLE.sendEvent('s_volume', $scope.settings.volume);
            $scope.savedVolume = $scope.settings.volume;
            return;
        }

        if ($scope.delayedSetVolume) {
            clearTimeout($scope.delayedSetVolume);
            delete $scope.delayedSetVolume;
        }
        $scope.delayedSetVolume = setTimeout(function() {
            console.log('Changing Volume ' + $scope.settings.volume);
            delete $scope.delayedSetVolume;
            NascentBLE.sendEvent('s_volume', $scope.settings.volume);
            $scope.savedVolume = $scope.settings.volume;
        }, 1000);
    };
});
