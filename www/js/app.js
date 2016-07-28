// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ionic-material']);

var kProductId = 'com.nascentobjects.RedCouCou';
app.run(function ($ionicPlatform, $rootScope) {
    $rootScope.kProductId = kProductId;

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

    .state('app.device', {
        url: '/device',
        views: {
            'menuContent': {
                templateUrl: 'templates/device.html',
                controller: 'DeviceCtrl'
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

    .state('app.speaker', {
        url: '/speaker',
        views: {
            'menuContent': {
                templateUrl: 'templates/speaker.html',
                controller: 'SpeakerCtrl'
            }
        }
    })

    .state('app.camera', {
        url: '/camera',
        views: {
            'menuContent': {
                templateUrl: 'templates/camera.html',
                controller: 'CameraCtrl'
            }
        }
    })

    .state('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: 'templates/about.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('app.troubleshooting', {
        url: '/troubleshooting',
        views: {
            'menuContent': {
                templateUrl: 'templates/troubleshooting.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('app.nopermission', {
        url: '/nopermission',
        views: {
            'menuContent': {
                templateUrl: 'templates/nopermission.html',
                controller: 'AboutCtrl'
            }
        }
    })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/device');
});
