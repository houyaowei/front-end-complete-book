import "whatwg-fetch";
import axios from "axios";

import URL from "./urlConfig";

let getData = function(url, data, resolve) {
  let option = {
    method: "POST",
    credentials: "include",
    body: data
  };
  fetch(url, option)
    .then(resp => resp.json())
    .then(data => {
      resolve({ res: data });
    })
    .catch(err => {
      console.log(err);
    });
};

export function login() {
  // return new Promise(resolve => {
  //   console.log("ajaxService");
  //   let url = URL.login;
  //   let postData = {};
  //   // getData(url, postData, resolve);
  //   resolve({ res: true });
  // });
	return axios.post('http://localhost:4000/graphql', {
  query: '{ language }'
}) 
}
export function addNumber(a,b) {
  
	var query = `query result($a: Int, $b: Int) {
	  result(a: $a, b: $b)
	}`;
	console.log("ajax server ,a:",a ,",b:",b);
	
return new Promise(resolve => {
	fetch('http://localhost:4000/graphql', {
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Accept': 'application/json',
	  },
	  body: JSON.stringify({
	    query,
	    variables: { a, b },
	  })
	})
	  .then(r => r.json())
	  .then(data => resolve(data.data));
	})
};
