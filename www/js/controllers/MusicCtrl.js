app.controller('MusicCtrl', function ($scope, $stateParams, ionicMaterialInk, NascentBLE, $ionicLoading, $ionicScrollDelegate) {
    ionicMaterialInk.displayEffect();

    $scope.tracks = [];
    $scope.playData = {
        paused: true,
        currTrack: 0
    };

    $scope.$on('$ionicView.afterEnter', function() {
        NascentBLE.sendEvent('gospotify');
        if ($scope.tracks.length === 0) {
            NascentBLE.sendEvent('needtracks');
            $ionicLoading.show({
                content: 'Getting tracks',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $scope.needTracksBackup = setTimeout(function() {
                NascentBLE.dataSync.clearEventQueue();
                NascentBLE.sendEvent('needtracks');
            }, 10000);
        }
    });

    $scope.play = function() {
        if ($scope.playData.paused) {
            $scope.playData.paused = false;
            NascentBLE.sendEvent('s_play');
        } else {
            $scope.playData.paused = true;
            NascentBLE.sendEvent('s_pause');
        }
        $ionicScrollDelegate.scrollTop();
        $scope.$apply();
    };

    $scope.skipBack = function() {
        --$scope.playData.currTrack;
        if ($scope.playData.currTrack < 0) {
            $scope.playData.currTrack = $scope.tracks.length-1;
        }
        NascentBLE.sendEvent('s_prev');
        $ionicScrollDelegate.scrollTop();
        $scope.$apply();
    };

    $scope.skipForward = function() {
        ++$scope.playData.currTrack;
        if ($scope.playData.currTrack >= $scope.tracks.length) {
            $scope.playData.currTrack = 0;
        }
        NascentBLE.sendEvent('s_next');
        $ionicScrollDelegate.scrollTop();
        $scope.$apply();
    };

    $scope.playTrack = function(index) {
        var realIndex = ($scope.playData.currTrack + index) % $scope.tracks.length;
        $scope.playData.currTrack = realIndex;

        console.log('PLAY TRACK: ' + index + ',' + realIndex + ',' +  $scope.playData.currTrack);
        NascentBLE.sendEvent('s_playtrack', realIndex);
        $ionicScrollDelegate.scrollTop();
        $scope.$apply();
    };

    $scope.changeVolume = function() {
        if (Math.abs($scope.savedVolume - $scope.playData.volume) > 10) {
            NascentBLE.sendEvent('s_volume', $scope.playData.volume);
            $scope.savedVolume = $scope.playData.volume;
            return;
        }

        if ($scope.delayedSetVolume) {
            clearTimeout($scope.delayedSetVolume);
            delete $scope.delayedSetVolume;
        }
        $scope.delayedSetVolume = setTimeout(function() {
            console.log('Changing Volume ' + $scope.playData.volume);
            delete $scope.delayedSetVolume;
            NascentBLE.sendEvent('s_volume', $scope.playData.volume);
            $scope.savedVolume = $scope.playData.volume;
        }, 1000);
    };

    NascentBLE.on('tracks', function(tracks) {
        if ($scope.needTracksBackup) {
            clearTimeout($scope.needTracksBackup);
            delete $scope.needTracksBackup;
        }
        $ionicLoading.hide();
        console.log('Received Tracks: ' + JSON.stringify(tracks));
        $scope.tracks = tracks.t;
        $scope.playData = tracks.d;
        $scope.savedVolume = $scope.playData.volume;
        $scope.$apply();
    });

    NascentBLE.on('playdata', function(playData) {
        $scope.playData = playData;
        $scope.savedVolume = $scope.playData.volume;
        $scope.$apply();
    });

    $scope.getSortedTracks = function() {
        var ret = new Array($scope.tracks.length);
        var a;

        for (a=$scope.playData.currTrack; a<$scope.tracks.length; ++a) {
            ret[a-$scope.playData.currTrack] = $scope.tracks[a];
        }

        for (a=0; a<$scope.playData.currTrack; ++a) {
            ret[$scope.tracks.length-$scope.playData.currTrack+a] = $scope.tracks[a];
        }

        return ret;
    };

});
