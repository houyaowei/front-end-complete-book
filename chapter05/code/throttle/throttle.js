/**
 func: 回调函数
 time: 间隔时间
*/
function throttle (func,time) {
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