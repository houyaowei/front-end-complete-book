function debounce (func,time) {
	if(typeof func !== 'function') {
     throw new TypeError('need a function');
  }
	let timeId = null;
	return function(){
		let _this = this;
		clearTimeout(timeId);
		// timeId = setTimeout(func, time);
		timeId = setTimeout(() => {
			func.apply(_this, arguments)
		}, time);
	}
}