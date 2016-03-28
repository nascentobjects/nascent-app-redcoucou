app.controller('SettingsCtrl', function ($scope, $stateParams, ionicMaterialInk, Settings, NascentBLE) {
    ionicMaterialInk.displayEffect();

    $scope.settings = Settings.settings;

    $scope.$on('$ionicView.afterEnter', function() {
        NascentBLE.sendEvent('needsettings');
    });

    $scope.updateSettings = function() {
        NascentBLE.sendEvent('settings', $scope.settings);
    };

    $scope.updateSpeed = function() {
        if (Math.abs(Settings.savedSpeed - $scope.settings.speed) > 0.5) {
            NascentBLE.sendEvent('s', $scope.settings.speed);
            Settings.savedSpeed = $scope.settings.speed;
            return;
        }

        if ($scope.delayedSetSpeed) {
            clearTimeout($scope.delayedSetSpeed);
            delete $scope.delayedSetSpeed;
        }

        $scope.delayedSetSpeed = setTimeout(function() {
            delete $scope.delayedSetSpeed;
            NascentBLE.sendEvent('s', $scope.settings.speed);
            Settings.savedSpeed = $scope.settings.speed;
        }, 250);
    };

    $scope.triggerNotification = function() {
        var title = 'Nascent Objects';
        var text = 'Products Made Fresh';
        var delay = 5000;
        NascentBLE.sendEvent('notification', { title: title, text: text, delay: delay });
        var now = new Date().getTime();
        cordova.plugins.notification.local.schedule({
            id: 1,
            title: title,
            text: text,
            at: new Date(now + delay),
        });
    };
});
