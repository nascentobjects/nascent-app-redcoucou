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

    $scope.eject = function() {
        NascentBLE.sendEvent('eject');
    };

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }

    var fab = document.getElementById('fab');
    fab.addEventListener('click', function () {
        //location.href = 'https://twitter.com/satish_vr2011';
        window.open('https://twitter.com/satish_vr2011', '_blank');
    });

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


    // .fromTemplate() method
    var template = '<ion-popover-view>' +
                    '   <ion-header-bar>' +
                    '       <h1 class="title">My Popover Title</h1>' +
                    '   </ion-header-bar>' +
                    '   <ion-content class="padding">' +
                    '       My Popover Contents' +
                    '   </ion-content>' +
                    '</ion-popover-view>';

    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
});
