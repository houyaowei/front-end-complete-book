(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var module1 = createCommonjsModule(function (module) {
	  module["export"] = function () {
	    return "aa";
	  };
	});

	module1();

})));
