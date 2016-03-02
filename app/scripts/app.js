/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc overview
* @name dashboard
* @description
* # dashboard
*
* Main module of the application.
*/
angular.module('dashboard', [
    'ngAnimate',
    'ngTouch',
    'ui.router',
    'AhjoSigningService',
    'ui.bootstrap',
    'ngSanitize',
    'wysiwyg.module',
    'ngDialog',
    'pascalprecht.translate'
])
.config(function($urlRouterProvider, $stateProvider, ENV, G_APP, $logProvider, $provide, $compileProvider, $translateProvider, $httpProvider) {
    // Startup logged always regardless of ENV config, so using console instead of $log
    console.log('dashboard.config: ver: ' +G_APP.app_version  +' env: ' +ENV.app_env +' logging: ' +ENV.app_debuglogs);

    /* Set application level logging. Affects $log, not console */
    var doDbg = false;
    if (ENV && ENV.app_debuglogs) {
        doDbg = ENV.app_debuglogs;
        $translateProvider.useMissingTranslationHandlerLog();
    }
    $logProvider.debugEnabled(doDbg);

    /* Override $log functions to respect app-level setting for logging */
    $provide.decorator('$log', function ($delegate) {
        var infoFn = $delegate.info;
        var logFn = $delegate.log;

        $delegate.info = function () {
            if ($logProvider.debugEnabled()) {
                infoFn.apply(null, arguments);
            }
        };

        $delegate.log = function () {
            if ($logProvider.debugEnabled()) {
                logFn.apply(null, arguments);
            }
        };
        return $delegate;
    });

    $translateProvider
    .useStaticFilesLoader({
        prefix: 'loc/lang-',
        suffix: '.json'
    })
    .preferredLanguage('fi')
    .fallbackLanguage('fi')
    .useSanitizeValueStrategy('escapeParameters')
    .use('fi');

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);

    $httpProvider.defaults.withCredentials = true;
})
.run(function($rootScope, $log, DEVICE, $window, MENU, APPSTATE, $state) {
    $rootScope.$on('$stateChangeStart', function (event, next/*, toParams, fromParams*/) {
        $log.debug('app.stateChangeStart: ' +next.name);// +' toParams: ' +JSON.stringify(toParams) +' fromParams: ' +JSON.stringify(fromParams));
    });

    $rootScope.$on('$stateChangeError', console.error.bind(console)); // $log.error.bind didn't work for .spec tests
    // GLOBAL VARIABLES
    // $rootScope.device    MOBILE = 1, DESKTOP = 2
    // $rootScope.menu      FULL = 2, HALF = 1,  CLOSED = 0

    var device = document.getElementById("device");

    if (device && window.getComputedStyle(device,null).getPropertyValue("min-width") === '320px') {
        $rootScope.device = DEVICE.MOBILE;
        $rootScope.mobile = true;
    }
    else {
        $rootScope.device = DEVICE.DESKTOP;
        $rootScope.mobile = false;
    }

    $rootScope.isScreenXs = function() {
        return $rootScope.device === DEVICE.MOBILE;
    };

    $rootScope.goHome = function() {
        $state.go(APPSTATE.HOME);
    };

    $rootScope.goBack = function() {
        $window.history.back();
    };

    $rootScope.goErrorLanding = function() {
        $state.go(APPSTATE.ERROR);
    };

    $rootScope.openMenu = function() {
        $rootScope.menu = MENU.FULL;
    };

    $rootScope.closeMenu = function() {
        if ($rootScope.menu > MENU.CLOSED) {
            $rootScope.menu = $rootScope.menu - 1;
        }
    };

    $rootScope.menuClosed = function() {
        return $rootScope.menu === MENU.CLOSED;
    };

    $rootScope.menuHalf = function() {
        return $rootScope.menu === MENU.HALF;
    };

    $rootScope.menuFull = function() {
        return $rootScope.menu === MENU.FULL;
    };

    // Utility function for looping an object to find the first immediate child object with matching value
    // Returns null on bad arguments or if no match.
    $rootScope.objWithVal = function (arr, prop, val) {
        var res = null;
        if (!arr || typeof arr !== 'object' || !prop) {
            $log.error("app.objWithVal: bad arguments: arr:" + arr + " prop:" + prop + " val:" + val);
            return res;
        }

        var tmp;
        for (var p in arr) {
            tmp = arr[p];
            if (tmp && prop in tmp && tmp[prop] === val) {
                res = tmp;
                break;
            }
        }
        return res;
    };
});

angular.module('dashboard').config(function($provide) {
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function($delegate, $injector) {
        return function(aException, aCause) {
            $delegate(aException, aCause);

            console.log('dashboard.exceptionHandler: redirecting state');
            var $rs = $injector.get("$rootScope");
            $rs.apperror = { exception: aException, cause: aCause};
            $rs.goErrorLanding();
        };
    }]);
});
