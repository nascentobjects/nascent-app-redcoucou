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
var bluetoothle;

function NascentDataSync(options) {
    EventEmitter.call(this);

    console.log('----------------------------------');
    console.log('----------------------------------');
    console.log('----------------------------------');
    console.log('----------------------------------');
    console.log('----------------------------------');
    console.log('----------------------------------');

    if (!('id' in options)) {
        throw 'An id must be given';
    }

    this.verbose = false;
    if (options.verbose) {
        this.verbose = true;
    }

    this.id = options.id;
    var ids = this.id.split('.');
    this.deviceName = ids[ids.length-1];
    this.DataFlagChunkStart = 'S';
    this.DataFlagChunkEnd = 'E';
    this.DataFlagChunkMiddle = 'M';
    this.DataFlagChunkFull = 'F';
    this.NascentDataSyncCommandCharacteristicUUID = 'c50dc35b-9a1b-40c2-bc97-96ee7254579c';
    this.serviceUUID = '686c3dbf-2f84-4eb8-8e62-0c12fc534f7c';
    this.connectedAddress = null;
    this.pendingConnectSuccessCbs = [];
    this.pendingConnectErrorCbs = [];
    this.pendingChunks = [];
    this.pendingSubscribeData = '';

    var self = this;
    self.log('Checking permissions');
    bluetoothle.hasPermission(function(result) {
        self.log('Permission Result: ' + JSON.stringify(result));
        if (result.requestPermission) {
            self.log('Have Permission.  Moving on with normal connection');
            self.whenConnected(function(result) {
                self.log('CONNECTED');
            }, function(err, stage) {
                self.log('ERROR');
            });
            return;
        }

        self.log('No permission. requesting...');
        bluetoothle.requestPermission(function(result) {
            self.log('Permission Success: ' + JSON.stringify(result));
            self.whenConnected(function(result) {
                self.log('CONNECTED');
            }, function(err, stage) {
                self.log('ERROR');
            });
        }, function(err) {
            self.log('Permission Failure: ' + JSON.stringify(err));
            self.emit('no_permissions');
        });
    });
}

NascentDataSync.prototype = Object.create(EventEmitter.prototype);
NascentDataSync.prototype.constructor = NascentDataSync;

NascentDataSync.prototype.log = function(msg) {
    if (this.verbose) {
        console.log(msg);
    }
};

NascentDataSync.prototype.whenConnected = function(successCb, errCb) {
    var self = this;

    function deferCbs() {
        if (successCb) {
            self.pendingConnectSuccessCbs.push(successCb);
        }
        if (errCb) {
            self.pendingConnectErrorCbs.push(errCb);
        }
    }

    function actuallyInitialize(successCb, errCb) {
        startScan(successCb, deferCbs);
        return;
        bluetoothle.initialize(function(result) {
            startScan(successCb, deferCbs);
        }, function(err) {
            self.initializing = false;
            self.log('Initialize err: ' + JSON.stringify(err));
            if (errCb) {
                errCb(err, 'initialize');
            }
        });
    }

    function enable(cb) {
        self.log('Enabling');
        bluetoothle.enable();
        setTimeout(cb, 2500);
    }

    function disable(cb) {
        self.log('Disabling');
        bluetoothle.disable();
        setTimeout(cb, 2500);
    }

    function initialize(successCb, errCb) {
        self.initializing = true;
        self.log('Initializing');

        bluetoothle.initialize(function(result) {
            bluetoothle.isEnabled(function(result) {
                if (result.isEnabled) {
                    self.log('Enabled, will disable then reenable');

                    disable(function() {
                        enable(function() {
                            actuallyInitialize(successCb, errCb);
                        });
                    });
                }
            });
        }, function(err) {
            if (err.error === 'enable') {
                self.log('Bluetooth not enabled, will do so');
                enable(function() {
                    actuallyInitialize(successCb, errCb);
                });
                return;
            }

            self.log('Initialize err: ' + JSON.stringify(err));
            self.initializing = false;
            if (errCb) {
                errCb(err, 'initialize');
            }
        });
    }

    function startScan(successCb, errCb) {
        self.log('Starting Scan');
        bluetoothle.startScan(function(result) {
            self.log('Scan Result: ' + JSON.stringify(result));
            console.log(self.deviceName);
            if (result.status === 'scanResult') {
                if (result.name === self.deviceName || result.name === 'BCM43340B0 37.4 MHz WLB' || result.name === 'NascentSpeaker') {
                    self.emit('found_candidate');
                    console.log('Connecting to ' + self.deviceName);
                    connectDevice(result.address, successCb, errCb);
                } else {
                    console.log('Rejecting ' + result.name + ' because it\'s not ' + self.deviceName);
                }
            }
        }, function(err) {
            self.initializing = false;
            self.log('Start Scan Error: ' + JSON.stringify(err));
            if (errCb) {
                errCb(err, 'startScan');
            }
        }, {
            services: []
        });
    }

    function connectDevice(address, successCb, errCb) {
        bluetoothle.stopScan();
        setTimeout(function() {
            self.log('BLAH CONNECTING: ' + address);
            bluetoothle.connect(function(result) {
                self.log('Connect Status: ' + result.status);
                if (result.status === 'connected') {
                    self.log('Connect Result: ' + JSON.stringify(result));
                    discoverDevice(address, successCb, errCb);
                } else if (result.status === 'disconnected' && result.address === self.connectedAddress) {
                    self.emit('disconnect');
                    self.log('Disconnected on connected address.  Try reconnecting');
                    self.whenConnected(function() {
                        self.log('Reconnected after disconnect');
                    });
                }
            }, function(err) {
                self.initializing = false;
                self.log('Connect Error: ' + JSON.stringify(err));
                if (self.connectedAddress === err.address) {
                    self.emit('disconnect');
                    self.connectedAddress = null;
                }

                errCb && errCb('Failed, restarting');
                self.log('Closing connection after connect fail');

                function redoSetup() {
                    disable(function() {
                        enable(function() {
                            self.whenConnected(function() {
                                self.log('Connected again after failed connection');
                            });
                        });
                    });
                }
                bluetoothle.close(function(result) {
                    self.log('Close Success: ' + JSON.stringify(err));
                    redoSetup();
                }, function(err) {
                    self.log('Close Error: ' + JSON.stringify(err));
                    redoSetup();
                }, {
                    address: address
                });

                //reconnectDevice(address, successCb, errCb);
            }, {
                address: address
            });
        }, 1000);
    }

    function reconnectDevice(address, successCb, errCb) {
        if (self.connectedAddress) {
            self.log('Reconnect: Have Connected Address');
            // seems like we managed to connect to another device successfully
            return;
        }
        function reconnect() {
            setTimeout(function() {
                self.log('Reconnecting: ' + address);
                bluetoothle.reconnect(function(result) {
                    self.log('Reconnect Status: ' + result.status);
                    if (result.status === 'connected') {
                        self.log('Reconnect result: ' + JSON.stringify(result));
                        discoverDevice(address, successCb, errCb);
                    }
                }, function(err) {
                    self.log('Reconnect Error: ' + JSON.stringify(err));
                    reconnectDevice(address, successCb, errCb);
                }, {
                    address: address
                });
            }, 100);
        }

        bluetoothle.disconnect(function(result) {
            reconnect();
        }, function(err) {
            reconnect();
        }, {
            address: address
        });

    }

    function subscribeDevice(address, successCb, errCb) {
        self.log('SUBSCRIBING: ' + address);
        bluetoothle.subscribe(function(result) {
            if (result.status === 'subscribed') {
                self.log('Successfully subscribed');
                self.emit('connect');
                bluetoothle.stopScan();
                self.connectedAddress = result.address;
                self.initializing = false;
                if (successCb) {
                    successCb(result);
                }
            } else if (result.status === 'subscribedResult') {
                var v = bluetoothle.bytesToString(bluetoothle.encodedStringToBytes(result.value));
                self.log('Received: ' + v);
                switch (v[0]) {
                    case self.DataFlagChunkStart:
                        self.pendingSubscribeData = v.slice(1);
                        break;
                    case self.DataFlagChunkMiddle:
                        self.pendingSubscribeData += v.slice(1);
                        break;
                    case self.DataFlagChunkEnd:
                        self.pendingSubscribeData += v.slice(1);
                        self.receivedEventData(self.pendingSubscribeData);
                        self.pendingSubscribeData = '';
                        break;
                    case self.DataFlagChunkFull:
                        self.pendingSubscribeData = v.slice(1);
                        self.receivedEventData(self.pendingSubscribeData);
                        self.pendingSubscribeData = '';
                        break;
                }
            }
        }, function(err) {
            self.initializing = false;
            if (errCb) {
                errCb(err, 'subscribe');
            }
        }, {
            address: address,
            service: self.serviceUUID,
            characteristic: self.NascentDataSyncCommandCharacteristicUUID,
            isNotification: true
        });
    }

    function discoverDevice(address, successCb, errCb) {
        setTimeout(function() {
            self.log('Discovering: ' + address);
            bluetoothle.discover(function(result) {
                var found = false;
                for (var a=0; a<result.services.length; ++a) {
                    if (result.services[a].uuid === self.serviceUUID) {
                        found = true;
                        break;
                    } else {
                        self.log(JSON.stringify(result.services));
                        self.log(result.services[a].uuid + ' not ' + self.serviceUUID);
                    } 
                }
                if (found) {
                    self.log('Connected');
                    subscribeDevice(address, successCb, errCb);
                }
            }, function(err) {
                self.initializing = false;
                self.log('Discover error: ' + JSON.stringify(err));
                if (errCb) {
                    errCb(err, 'discover');
                }
            }, {
                address: address
            });
        }, 1500);
    }

    function success(result) {
        self.log('BLE SUCCESS');
        var a;

        successCb(result);

        for (a=0; a<self.pendingConnectSuccessCbs.length; ++a) {
            self.pendingConnectSuccessCbs[a](result);
        }

        self.pendingConnectSuccessCbs = [];
        self.pendingConnectErrorCbs = [];
    }

    function fail(err, stage) {
        self.log('Error in ' + stage + ': ' + JSON.stringify(err));
        var a;

        errCb(err, stage);

        for (a=0; a<self.pendingConnectErrorCbs.length; ++a) {
            self.pendingConnectErrorCbs[a](err, stage);
        }

        self.pendingConnectSuccessCbs = [];
        self.pendingConnectErrorCbs = [];
    }

    function tryInitialize() {
        if (self.initializing) {
            return;
        }
        self.initializing = true;
        bluetoothle.isInitialized(function(result) {
            if (result.isInitialized) {
                self.log('Already initialized.  Checking for scanning.');
                bluetoothle.isScanning(function(result) {
                    if (result.isScanning) {
                        self.log('Already initialized and scanning.  Just wait for other result');
                        deferCbs();
                    } else {
                        self.log('Already initialized but will start scanning');
                        startScan(success, deferCbs);
                    }
                });
            } else {
                self.log('Not initialized.  Will do so');
                initialize(success, fail)
            } 
        });
    }

    if (!self.connectedAddress) {
        tryInitialize();
    } else {
        bluetoothle.isConnected(function(result) {
            if (result.isConnected) {
                successCb({
                    address: self.connectedAddress
                });
            } else {
                delete self.connectedAddress;
                tryInitialize();
            }
        }, function(err) {
            delete self.connectedAddress;
            tryInitialize();
        }, {
            address: self.connectedAddress
        });
    }
};

NascentDataSync.prototype.receivedEventData = function(json) {
    var self = this;
    var obj = '';
    try {
        obj = JSON.parse(json);
    } catch (e) {
        console.log('nascent-datasync\tThrew out malformed json data packet: ' + json, e);
        return;
    }
    this.emit(obj.c, obj.a);
};

NascentDataSync.prototype.clearEventQueue = function() {
    // WARNING: only do this if you suspect something is going wrong and need to make sure you're on a clean slate.
    this.pendingChunks = [];
    this.processingSendChunks = false;
};

NascentDataSync.prototype.sendEvent = function(eventName, args) {
    var self = this;
    this.whenConnected(function(result) {
        var json;

        if (typeof args != 'undefined') {
            json = '{"c":"' + eventName + '","a":' + JSON.stringify(args) + '}';
        } else {
            json = '{"c":"' + eventName + '"}';
        }

        var flag;
        var data;
        for (var a=0; a<json.length; a+=19) {
            if (a === 0 && a+19 >= json.length) {
                flag = self.DataFlagChunkFull;
            } else if (a+19 >= json.length) {
                flag = self.DataFlagChunkEnd;
            } else if (a === 0) {
                flag = self.DataFlagChunkStart;
            } else {
                flag = self.DataFlagChunkMiddle;
            }
            var data = flag + json.slice(a, a+19);
            self.pendingChunks.push(data);
        }

        function processNextChunk() {
            if (self.pendingChunks.length === 0) {
                self.processingSendChunks = false;
                return;
            }

            if (self.pendingSubscribeData !== '') {
                setTimeout(processNextChunk, 100);
                return;
            }

            var chunk = self.pendingChunks[0];
            self.pendingChunks = self.pendingChunks.slice(1);
            self.log('nascent-datasync\tSending: ' + chunk);
            var v = bluetoothle.bytesToEncodedString(bluetoothle.stringToBytes(chunk));
            bluetoothle.write(function(result) {
                setTimeout(function() {
                    processNextChunk();
                }, 50);
            }, function(err) {
                self.log('Write Error: ' + JSON.stringify(err));
                throw err;
            }, {
                address: self.connectedAddress,
                value: v,
                service: self.serviceUUID,
                characteristic: self.NascentDataSyncCommandCharacteristicUUID
            });
        }

        if (!self.processingSendChunks) {
            self.processingSendChunks = true;
            processNextChunk();
        }
    });
};

