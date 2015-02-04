var ws = require("nodejs-websocket")
var connections = {};

function S4() {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
function guid()
{
	var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	return guid;
}

// Scream server example: "hi" -> "HI!!!" 
var server = ws.createServer(function (conn) {

	var myguid = guid();
	console.log("New connection:", myguid)

	connections[myguid] = conn;

	conn.on("text", function (str) {
		console.log("Received from " + myguid);

		var msg = JSON.parse(str);
		msg["from"] = myguid;
		str = JSON.stringify(msg);

		for (var key in connections) {

			if ((msg["to"] != null) && (key == msg["to"])) {
				console.log("Forwarding to: " + key);
				connections[key].sendText(str);
			} else if ((msg["to"] == null) && (key != myguid)) {
				console.log("Forwarding to: " + key);
				connections[key].sendText(str);
			}
		}
	});

	conn.on("close", function (code, reason) {
		console.log("closing connection: " + myguid);
		delete(connections[myguid]);
	});

	console.log(connections);
}).listen(8001)
