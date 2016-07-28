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
app.service('NascentBLE', function($rootScope, $location, $ionicLoading) {
    var NascentBLE = this;

    var fakeModules = false;

    NascentBLE.pendingEvents = [];
    NascentBLE.pendingOns = [];
    NascentBLE.connected = false;
    NascentBLE.foundCandidate = false;

    NascentBLE.isConnected = function() {
        return fakeModules || NascentBLE.connected;
    };

    NascentBLE.modules = {};
    if (fakeModules) {
        NascentBLE.modules = { main: true, speaker: true };
    }

    document.addEventListener('deviceready', function() {
        var a;

        NascentBLE.dataSync = new NascentDataSync({ id: $rootScope.kProductId, verbose: true });
        NascentBLE.dataSync.on('no_permissions', function() {
            $location.path('#/app/nopermission');
        });

        NascentBLE.dataSync.on('found_candidate', function() {
            NascentBLE.foundCandidate = true;
            $rootScope.$apply();
        });

        NascentBLE.dataSync.on('disconnect', function() {
            NascentBLE.foundCandidate = false;
            NascentBLE.connected = false;
            NascentBLE.modules = {};
            $ionicLoading.hide();
            $location.path('#/app/device');
            $rootScope.$apply();
        });

        NascentBLE.dataSync.on('connect', function() {
            NascentBLE.connected = true;

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

                NascentBLE.sendEvent('querymodules');

                NascentBLE.modules = { main: true };
                $rootScope.$apply();

                if (NascentBLE.eventModules) {
                    NascentBLE.dataSync.removeListener('modules', NascentBLE.eventModules);
                    nascentBLE.eventModules = null;
                }

                if (NascentBLE.eventMConn) {
                    NascentBLE.dataSync.removeListener('mconn', NascentBLE.eventMConn);
                    nascentBLE.eventMConn = null;
                }

                if (NascentBLE.eventMDisc) {
                    NascentBLE.dataSync.removeListener('mdisc', NascentBLE.eventMDisc);
                    nascentBLE.eventMDisc = null;
                }

                NascentBLE.eventModules = NascentBLE.dataSync.on('modules', function(moduleNames) {
                    NascentBLE.modules = { main: true };
                    for (var a=0; a<moduleNames.length; ++a) {
                        NascentBLE.modules[moduleNames[a]] = true;
                    }
                    $rootScope.$apply();
                });

                NascentBLE.eventMConn = NascentBLE.dataSync.on('mconn', function(moduleName) {
                    NascentBLE.modules[moduleName] = true;
                    $rootScope.$apply();
                });

                NascentBLE.eventMDisc = NascentBLE.dataSync.on('mdisc', function(moduleName) {
                    NascentBLE.modules[moduleName] = false;
                    $rootScope.$apply();
                });
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
