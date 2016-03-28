// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ionic-material']);

/*var kProductId = 'com.nascentobjects.hermes-clock';*/
/*var kProductId = 'com.nascentobjects.hermes-bike';*/
var kProductId = 'com.nascentobjects.hermes-app';
app.run(function ($ionicPlatform, $rootScope) {
    $rootScope.kProductId = kProductId;

    $rootScope.isBikeComputer = function() {
        return $rootScope.kProductId === 'com.nascentobjects.hermes-bike';
    };

    $rootScope.isSmartClock = function() {
        return $rootScope.kProductId === 'com.nascentobjects.hermes-clock';
    };

    $rootScope.isGenericApp = function() {
        return $rootScope.kProductId === 'com.nascentobjects.hermes-app';
    };


    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)

        /*
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        */
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})


app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.lists', {
        url: '/lists',
        views: {
            'menuContent': {
                templateUrl: 'templates/lists.html',
                controller: 'ListsCtrl'
            }
        }
    })

    .state('app.ink', {
        url: '/ink',
        views: {
            'menuContent': {
                templateUrl: 'templates/ink.html',
                controller: 'InkCtrl'
            }
        }
    })

    .state('app.motion', {
        url: '/motion',
        views: {
            'menuContent': {
                templateUrl: 'templates/motion.html',
                controller: 'MotionCtrl'
            }
        }
    })

    .state('app.components', {
        url: '/components',
        views: {
            'menuContent': {
                templateUrl: 'templates/components.html',
                controller: 'ComponentsCtrl'
            }
        }
    })

    .state('app.extensions', {
        url: '/extensions',
        views: {
            'menuContent': {
                templateUrl: 'templates/extensions.html',
                controller: 'ExtensionsCtrl'
            }
        }
    })

    .state('app.modules', {
        url: '/modules',
        views: {
            'menuContent': {
                templateUrl: 'templates/modules.html',
                controller: 'ModulesCtrl'
            }
        }
    })

    .state('app.directions', {
        url: '/directions',
        views: {
            'menuContent': {
                templateUrl: 'templates/directions.html',
                controller: 'DirectionsCtrl'
            }
        }
    })

    .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        }
    })

    .state('app.wifisetup', {
        url: '/wifisetup',
        views: {
            'menuContent': {
                templateUrl: 'templates/wifisetup.html',
                controller: 'WifiSetupCtrl'
            }
        }
    })

    .state('app.music', {
        url: '/music',
        views: {
            'menuContent': {
                templateUrl: 'templates/music.html',
                controller: 'MusicCtrl'
            }
        }
    })

    .state('app.weather', {
        url: '/weather',
        views: {
            'menuContent': {
                templateUrl: 'templates/weather.html',
                controller: 'WeatherCtrl'
            }
        }
    })
    ;

    // if none of the above states are matched, use this as the fallback
    if (kProductId === 'com.nascentobjects.hermes-bike') {
        $urlRouterProvider.otherwise('/app/directions');
    } else if (kProductId === 'com.nascentobjects.hermes-app') {
        $urlRouterProvider.otherwise('/app/modules');
    } else {
        $urlRouterProvider.otherwise('/app/music');
    }
});
