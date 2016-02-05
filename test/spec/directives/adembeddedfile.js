/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Directive: adEmbeddedFile', function () {

  // load the directive's module
  beforeEach(module('dashboard'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ad-embedded-file></ad-embedded-file>');
    element = $compile(element)(scope);
    expect(!!element).toBe(true);
  }));
});
