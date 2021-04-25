const res = await fetch("https://api.github.com/users/denoland");

const data = await res.json();
console.log(data);