/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
.constant(
    'DEVICE', {
        MOBILE: 1,
        DESKTOP: 2
    }
)
.constant(
    'MENU', {
        CLOSED: 0,
        HALF: 1,
        FULL: 2
    }
)
.constant(
    'BLOCKMODE', {
        BOTH : 0,
        UPPER : 1,
        LOWER : 2
    }
)
.constant(
    'HOMEMODE', {
        ALL : 0,
        MEETINGS : 1,
        ESIGN : 2
    }
)
.constant(
    'APPSTATE', {
        APP: "app",
        LOGIN: "app.login",
        INFO: "app.info",
        HOME: "app.home",
        OVERVIEW: "app.overview",
        MEETING: "app.meeting",
        SIGNITEM: "app.signitem"
    }
)
.constant(
    'MTGROLE', {
        NONE: 0,
        CHAIRMAN: 1,
        PARTICIPANT: 2
    }
)
.constant(
    'KEY', {
        MEETING: 'meeting',
        TOPIC: 'topic'
    }
)
.constant(
    'TOPICSTATUS', {
        NONE : 0,
        PENDING : 1,
        ACTIVE : 2,
        ABORTED : 3,
        READY : 4
    }
);
