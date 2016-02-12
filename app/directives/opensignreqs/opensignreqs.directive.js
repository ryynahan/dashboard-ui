/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:openSignreqs
 * @description
 * # openSignreqs
 */
angular.module('dashboard')
.directive('adOpenSignreqs', function () {
  var controller = ['$log', 'SigningOpenApi', 'SigningClosedApi', 'ENV', '$scope', function ($log, SigningOpenApi, SigningClosedApi, ENV, $scope) {
    $log.log("adOpenSignreqs.CONTROLLER");
    var self = this;

    self.VIEW_OPEN = 1;
    self.VIEW_CLOSED = 2;
    self.viewState = null;

    self.model = [];
    self.errClosed = null;
    self.errOpen = null;
    self.error = null;
    self.docStatuses = [];
    self.docTypes = [];
    self.FStatus = null;
    self.FType = null;


    /* PRIVATE FUNCTIONS */

    function DocStatus(status, txt) {
      this.val = status;
      this.txt = txt;
    }

    function DocType(type, txt) {
      this.val = type;
      this.txt = txt;
    }

    // returns true if 'arr' contains an object with property 'prop' with value 'val'
    function hasObjWithPropVal(arr, prop, val) {
      //$log.debug("adOpenSignreqs.arrayHasObjWith: " +prop +" val:" +val);
      var res;

      if (!arr || !prop || undefined === val) {
        $log.error("adOpenSignreqs.hasObjWithPropVal: bad arguments: arr:" +arr +" prop:" +prop +" val:" +val);
        res = false;
      }

      for (var ind = 0; ind < arr.length && res === undefined; ind++) {
        //$log.debug("adOpenSignreqs.hasObjWithPropVal: arr[" +ind +"][" +prop +"]=" +arr[ind][prop] +" match to prop: " +prop +" val: " +val);
        if (arr[ind] && prop in arr[ind] && arr[ind][prop] === val) {
          res = true;
          //$log.debug("adOpenSignreqs.hasObjWithPropVal: found");
        }
      }
      return res;
    }

    function cmpStr(a,b) {
      var m = a.txt.toLowerCase();
      var n = b.txt.toLowerCase();
      if (m < n) { //sort ascending
        return -1;
      }
      if (m > n) {
        return 1;
      }
      return 0;
    }

    function parseDocTypes() {
      //$log.debug("adOpenSignreqs.parseDocTypes");
      self.docTypes = [];
      for (var i = 0; i < self.model.length; i++) {
        var item = self.model[i];
        if (item && "DocumentType" in item && !hasObjWithPropVal(self.docTypes, 'val', item.DocumentType)) {
          self.docTypes.push(new DocType(item.DocumentType, self.signReqDocTypeTxt(item.DocumentType)));
        }
      }
      self.docTypes.sort(cmpStr);
    }

    function parseDocStatuses() {
      //$log.debug("adOpenSignreqs.parseDocStatuses");
      self.docStatuses = [];
      for (var i = 0; i < self.model.length; i++) {
        var item = self.model[i];
        if (item && "Status" in item && !hasObjWithPropVal(self.docStatuses, 'val', item.Status)) {
          self.docStatuses.push(new DocStatus(item.Status, self.signDocStatusTxt(item.Status)));
        }
      }
      self.docStatuses.sort(cmpStr);
    }

    function refreshModel() {
      switch(self.viewState) {
        case self.VIEW_OPEN:
          self.error = self.errOpen;
          self.model = self.responseOpen;
          break;
        case self.VIEW_CLOSED:
          self.error = self.errClosed;
          self.model = self.responseClosed;
          break;
        default:
          $log.error("adOpenSignreqs.refreshModel: Should not reach default here!");
          break;
      }

      parseDocTypes();
      parseDocStatuses();
    }

    function getOpen() {
      $log.debug("adOpenSignreqs: SigningOpenApi.query open");
      self.loadingOpen = true;
      self.responseOpen = SigningOpenApi.query(function() {
        $log.debug("adOpenSignreqs: SigningOpenApi.query open done: " +self.responseOpen.length);
        self.loadingOpen = false;
        self.errOpen = null;
      },
      function(error) {
        $log.error("adOpenSignreqs: SigningOpenApi.query open error: " +JSON.stringify(error));
        self.loadingOpen = false;
        self.errOpen = error;
      });
      self.responseOpen.$promise.finally(function() {
        $log.debug("adOpenSignreqs: SigningOpenApi.query open finally");
        refreshModel();
      });
    }

    function getClosed() {
      $log.debug("adOpenSignreqs: SigningOpenApi.query closed");
      self.loadingClosed = true;
      self.responseClosed = SigningClosedApi.query({byYear : 2015}, function(/*data*/) { // TODO: fix byYear
        $log.debug("adOpenSignreqs: SigningOpenApi.query closed done: " +self.responseClosed.length);
        self.loadingClosed = false;
        self.errClosed = null;
      },
      function(error) {
        $log.error("adOpenSignreqs: SigningOpenApi.query closed error: " +JSON.stringify(error));
        self.loadingClosed = false;
        self.errClosed = error;
      });
      self.responseClosed.$promise.finally(function() {
        $log.debug("adOpenSignreqs: SigningOpenApi.query closed finally");
        refreshModel();
      });
    }

    function setVwState(state) {
      $log.debug("adOpenSignreqs.setVwState: " +state);
      self.model = [];
      self.viewState = state;
      self.setModelFilter(null);
      self.model = [];
      switch(state) {
        case self.VIEW_OPEN:
          if (!self.responseOpen) {
            getOpen();
          } else {
            refreshModel();
          }
          break;
        case self.VIEW_CLOSED:
          if (!self.responseClosed) {
            getClosed();
          } else {
            refreshModel();
          }
          break;
        default:
          $log.error("adOpenSignreqs.setVwState: Should not reach default here! " +state);
          break;
      }
    }

    /* PUBLIC FUNCTIONS */

    self.itemSelected = function(item) {
        $log.debug("adOpenSignreqs.adOpenSignreqs: "+ JSON.stringify(item));
        //$state.go('app.signitem', {signItem : item});
    };

    /* Resolve display text for item status */
   self.signDocStatusTxt = function(value) {
      var res = '';
      for (var k in ENV.SignApi_DocStatuses) {
        //console.log("k: " +k +" v: " +ENV.SignApi_DocStatuses[k]); //TODO: remove, and check why array iterated many times
        if (ENV.SignApi_DocStatuses[k].value === value) {
          res = ENV.SignApi_DocStatuses[k].name;
          break;
        }
      }
      return res;
    };

    self.signDocTypeTxt = function(value) {
      var res = '';
      for (var k in ENV.SignApi_DocTypes) {
        //console.log("k: " +k +" v: " +ENV.SignApi_DocTypes[k]); //TODO: remove, and check why array iterated many times
        if (ENV.SignApi_DocTypes[k].value === value) {
          res = ENV.SignApi_DocTypes[k].name;
          break;
        }
      }
      return res;
    };

    /* Resolve display text for document type */
    self.signReqDocTypeTxt = function(value) {
      var res = null;
      for (var k in ENV.SignApi_DocTypes) {
        //console.log("k: " +k +" v: " +ENV.SignApi_DocTypes[k]); //TODO: remove, and check why array iterated many times
        if (ENV.SignApi_DocTypes[k].value === value) {
          res = ENV.SignApi_DocTypes[k].name;
          break;
        }
      }
      return res;
    };

    /* Is current state loading data */
    self.loading = function() {
      var res = false;
      if ((self.viewState === self.VIEW_OPEN && self.loadingOpen) || (self.viewState === self.VIEW_CLOSED && self.loadingClosed)) {
        res = true;
      }
      return res;
    };

    /* Resolve css class for item status */
    self.badgeClass = function(status) {
      var res = 'label-default';
      switch(status) {
        case ENV.SignApi_DocStatuses.unsigned.value:
          res = 'label-danger';
          break;
        case ENV.SignApi_DocStatuses.rejected.value:
          res = 'label-warning';
          break;
        case ENV.SignApi_DocStatuses.signed.value:
          res = 'label-success';
          break;
        case ENV.SignApi_DocStatuses.returned.value:
          res = 'label-info';
          break;
        case ENV.SignApi_DocStatuses.undecided.value:
          res = 'label-primary';
          break;
        default:
          res = 'label-default';
      }
      return res;
    };

    self.setModelFilter = function(filter) {
      if (filter instanceof DocType) {
        $log.log("adOpenSignreqs.setModelFilter: DocType " +filter.val +"/" +filter.txt);
        self.FType = filter;
      } else if (filter instanceof DocStatus) {
        $log.log("adOpenSignreqs.setModelFilter: DocStatus " +filter.val +"/" +filter.txt);
        self.FStatus = filter;
      } else {
        $log.debug("adOpenSignreqs.setModelFilter: clear");
        self.FType = null;
        self.FStatus = null;
      }
    };

    self.docFilter = function(item) {
      var res = true;
      if (self.FType) {
        res = item.DocumentType === self.FType.val;
        //$log.log("adOpenSignreqs.docFilter: FType=" +self.FType.val +" item: " +item.DocumentType);
      }
      if (res && self.FStatus) {
        res = item.Status === self.FStatus.val;
        //$log.log("adOpenSignreqs.docFilter: FStatus=" +self.FStatus.val +" item: " +item.Status);
      }
      //$log.log("adOpenSignreqs.docFilter: " +res);
      return res;
    };

    $scope.$watch('closeditems', function(newValue/*, oldValue*/) {
      //$log.debug("adOpenSignreqs.watch closeditems: " +newValue +" old:" +oldValue);
      if (newValue) {
        setVwState(self.VIEW_CLOSED);
      } else {
        setVwState(self.VIEW_OPEN);
      }
    });

  }];

  return {
    controller: controller,
    controllerAs: 'ctrl',
    templateUrl: 'directives/opensignreqs/opensignreqs.directive.html',
    restrict: 'E',
    replace: 'true',
    scope: {
      closeditems: '='
    }
  };
});
