/*
 * @author Andrew Robberts <andrew@nascentobjects.com>
 * @copyright 2015-2016 Nascent Objects Inc. All rights reserved.
 */

app.service('NascentBLE', function($ionicLoading, $rootScope) {
    var NascentBLE = this;

    NascentBLE.pendingEvents = [];
    NascentBLE.pendingOns = [];

    document.addEventListener('deviceready', function() {
        var a;

        NascentBLE.dataSync = new NascentDataSync({ id: $rootScope.kProductId, verbose: true });

        $ionicLoading.show({
            content: 'Connecting to Device',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        NascentBLE.dataSync.on('disconnect', function() {
            $ionicLoading.show({
                content: 'Connecting to Device',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        });

        NascentBLE.dataSync.on('connect', function() {
            $ionicLoading.hide();

            setTimeout(function() {
                // register for all pending events
                for (a=0; a<NascentBLE.pendingOns.length; ++a) {
                    var e = NascentBLE.pendingOns[a];
                    NascentBLE.dataSync.on(e.eventName, e.cb);
                    console.log('Registering Pending ' + e.eventName);
                }

                // send all pending events
                for (a=0; a<NascentBLE.pendingEvents.length; ++a) {
                    var e = NascentBLE.pendingEvents[a];
                    NascentBLE.dataSync.sendEvent(e.eventName, e.args);
                    console.log('Sending Pending ' + e.eventName);
                }
                NascentBLE.pendingEvents = [];
            }, 1000);
        });
    }, false);

    NascentBLE.sendEvent = function(eventName, args) {
        if (NascentBLE.dataSync) {
            NascentBLE.dataSync.sendEvent(eventName, args);
        } else {
            NascentBLE.pendingEvents.push({
                eventName: eventName,
                args: args
            });
        }
    };

    NascentBLE.on = function(eventName, cb) {
        if (NascentBLE.dataSync) {
            NascentBLE.dataSync.on(eventName, cb);
        } else {
            NascentBLE.pendingOns.push({
                eventName: eventName,
                cb: cb
            });
        }
    };
});
