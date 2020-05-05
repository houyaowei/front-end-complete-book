
/*
	后台计算worker
*/

onmessage = function (event) {
	console.log(event)
	let status = event.data.status;
	if (status == 0) {
		startToCalc();
	}
}


function startToCalc(){
	let t1 = new Date().getTime();
	console.log('t1:' ,t1);

	let arr = [22,41,208,12,39,30,42,45,67,54,33,0,10,7,73,41,208,12,39,30,16,45,107,54,23,20,10,43,57];
	let total = arr.reduce(function (total,item) {
		return total + item;
	}, 0);
	let t2 = new Date().getTime(); 
	console.log('t1:' ,t2);

	postMessage("活干完了！所有值的和为：" + total+ ", 耗时：" + (t2-t1)+"毫秒")
}