/**
 func: 回调函数
 time: 间隔时间
*/
function throttle (func,time) {
	if(typeof func !== 'function') {
      throw new TypeError('we need a function');
   }
	//记录上次执行的时间
	let precious = 0;
	
	return function(){
		let _this = this;
		let now = Date.now();
		if (now - precious > time ) {
			func.apply(_this, arguments);
			precious = now;
		}
	}
}