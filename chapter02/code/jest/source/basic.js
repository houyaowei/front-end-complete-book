const axios = require("axios");
let url = 'https://jsonplaceholder.typicode.com/todos/1';

function sum(a,b){
  const na = a || 0;
  const nb = b || 0;
  return na + nb;
}

/**
 * 正常的ajax请求
 * @returns 
 */
function fetchData() {  
  return axios.get(url)
      .then(res => res.data)
      .catch(error => console.log(error));
}

async function fetchDataWithAwait() {
  const res = await fetchData();
  return res;
}

function testException(){
   throw new Error("no cookies")
}

module.exports = {
  sum,
  fetchData,
  fetchDataWithAwait,
  testException
}