const http = require("http")

console.log(process.env.npm_package_config_port)

http.createServer(function (req, res) {
	res.end('Hello World\n');
}).listen(process.env.npm_package_config_port);