app.service('Settings', function(NascentBLE) {
    var Settings = this;
    this.settings = {
        colourScheme: 'White on Black',
        speed: 10.0,
        speedMultiplier: '1x',
    };

    NascentBLE.sendEvent('needsettings');

    NascentBLE.on('settings', function(settings) {
        Settings.settings = settings;
        Settings.savedSpeed = settings.speed;
    });

    this.speedMultiplier = function() {
        return parseInt(Settings.settings.speedMultiplier);
    };

});
