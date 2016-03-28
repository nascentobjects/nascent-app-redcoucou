app.controller('DirectionsCtrl', function ($scope, $stateParams, ionicMaterialInk, Settings, NascentBLE) {
    ionicMaterialInk.displayEffect();

    $scope.$on('$ionicView.afterEnter', function() {
        NascentBLE.sendEvent('needsettings');
    });

    function metersToMiles(m) {
        return m * 0.00062137; 
    }

    var start = new google.maps.LatLng(43, -89);
    var mapOptions = {
        center: start,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
    };
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // destination input and autocomplete
    $scope.destinationInput = document.getElementById('destination-input');
    (function pacSelectFirst(input) {
        // store the original event binding function
        var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

        function addEventListenerWrapper(type, listener) {
            // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
            // and then trigger the original listener.
            if (type == "keydown") {
                var orig_listener = listener;
                listener = function(event) {
                    if (event.which == 13) {
                        var simulated_downarrow = new window.KeyboardEvent('keydown', {
                            bubbles: true,
                            cancelable: true,
                            shiftKey: false
                        });
                        delete simulated_downarrow.keyCode;
                        Object.defineProperty(simulated_downarrow, 'keyCode', {'value': 40});
                        orig_listener.apply(input, [simulated_downarrow]);
                    }

                    orig_listener.apply(input, [event]);
                };
            }

            _addEventListener.apply(input, [type, listener]);
        }

        input.addEventListener = addEventListenerWrapper;
        input.attachEvent = addEventListenerWrapper;

        var autocomplete = new google.maps.places.Autocomplete(input);

    })($scope.destinationInput);  

    $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.destinationInput);
    $scope.destinationAutocomplete = new google.maps.places.Autocomplete($scope.destinationInput);
    $scope.destinationAutocomplete.bindTo('bounds', $scope.map);

    $scope.destinationAutocomplete.addListener('place_changed', function() {
        var place = $scope.destinationAutocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        $scope.destinationInput.blur();

        $scope.setRoute({ 'placeId': place.place_id });
    });

    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.directionsDisplay.setMap($scope.map);

    navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.myPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        $scope.map.setCenter($scope.myPos);
        $scope.myMarker = new google.maps.Marker({
            position: $scope.myPos,
            map: $scope.map,
            title: 'My Location',
            /*
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3
            },
            */
        });
    }, function(err) {
        alert('Unable to get location: ' + err.message);
    });

    $scope.destinationEnter = function() {
    };

    $scope.setBikePos = function(stepIndex, dist) {
        if (!$scope.steps || !$scope.bikeMarker) {
            return;
        }

        var step = $scope.steps[stepIndex];
        var stepDist = metersToMiles(step.distance.value);

        var percent = dist / stepDist;
        var pathIndex = Math.floor(percent * (step.path.length-1));
        var pathPercent = percent * (step.path.length-1) - pathIndex;

        var weights = new Array(step.path.length-1);
        var tot = 0;
        for (var a=0; a<step.path.length-1; ++a) {
            var x = step.path[a].lat() - step.path[a+1].lat();
            var y = step.path[a].lng() - step.path[a+1].lng();

            weights[a] = metersToMiles(Math.sqrt(x*x + y*y) * 100000);
            tot += weights[a];
        }

        var distLeft = dist;
        for (var a=0; a<weights.length; ++a) {
            if (distLeft < weights[a]) {
                pathIndex = a;
                pathPercent = distLeft / weights[a];
                break;
            }

            distLeft -= weights[a];
        }
        
        var startPos = step.path[pathIndex];
        var startLat = startPos.lat();
        var startLng = startPos.lng();

        var lat = startLat;
        var lng = startLng;

        if (pathIndex+1 < step.path.length) {
            var endPos = step.path[pathIndex+1];

            var endLat = endPos.lat();
            var endLng = endPos.lng();

            lat = startLat + (endLat - startLat) * pathPercent;
            lng = startLng + (endLng - startLng) * pathPercent;
        }

        $scope.bikeMarker.setPosition(new google.maps.LatLng(lat, lng));
        
    };

    $scope.simulate = function(duration) {
        if (!$scope.startedTravel) {
            return;
        }
        var hours = duration * Settings.speedMultiplier() / 60 / 60;
        var speed = Settings.settings.speed;

        var distTravel = hours * speed;
        $scope.dist += distTravel;

        var stepDist = metersToMiles($scope.steps[$scope.currStep].distance.value);
        if ($scope.dist >= stepDist) {
            if ($scope.currStep + 1 >= $scope.steps.length) {
                $scope.dist = 0;
                $scope.currStep = 0;
            } else {
                $scope.dist -= stepDist;
                $scope.currStep += 1;
            }
        }
        $scope.setBikePos($scope.currStep, $scope.dist);
    };

    NascentBLE.on('bike_pos', function(stepIndex) {
        $scope.dist = 0;
        $scope.currStep = stepIndex;
        $scope.startedTravel = true;
    });

    $scope.setRoute = function(destination) {
        $scope.myMarker.setMap(null);
        if (!$scope.bikeMarker) {
            $scope.bikeMarker = new google.maps.Marker({
                position: $scope.myPos,
                map: $scope.map,
                title: 'Bike Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3
                },
            });
        }
        var directions = {
            origin: $scope.myPos,
            destination: destination,
            travelMode: google.maps.TravelMode.BICYCLING
        };

        var turnByTurn = [];
        $scope.directionsService.route(directions, function(result, status) {

            console.log(result);

            if (status === google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(result);
                var leg = result.routes[0].legs[0];
                var stepDuration = 0;
                $scope.steps = leg.steps;
                for (var a=0; a<leg.steps.length; ++a) {
                    var step = leg.steps[a];
                    var dur = metersToMiles(step.distance.value);

                    if (a > 0 && step.maneuver === 'turn-right' || step.maneuver === 'turn-left') {
                        var on = '';
                        try {
                            on = step.instructions.split('>')[3].split('<')[0];
                        } catch (e) {
                            on = '';
                        }
                        turnByTurn.push({
                            stepIndex: a-1,
                            dist: stepDuration,
                            turn: (step.maneuver === 'turn-right' ? 'right' : 'left'),
                            on: on,
                        });
                        stepDuration = 0;
                    }

                    stepDuration += dur;

                    if (a === leg.steps.length-1) {
                        var destSide = step.instructions.split('Destination will be on the ');
                        if (destSide.length > 1) {
                            turnByTurn.push({
                                stepIndex: a,
                                dist: stepDuration,
                                turn: destSide[1].split('<')[0],
                                on: 'Destination'
                            });
                        }
                    }

                }
                NascentBLE.sendEvent('route', turnByTurn);

                $scope.currStep = 0;
                $scope.dist = 0;
                $scope.startedTravel = false;
                if ($scope.simInterval) {
                    clearInterval($scope.simInterval);
                }

                var kSimInt = 250;
                $scope.simInterval = setInterval(function() {
                    $scope.simulate(kSimInt / 1000);
                }, kSimInt);
            }
        });
    };
});
