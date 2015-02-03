var ws = require("nodejs-websocket")


var conn01 = null, 
    conn02 = null;
  
// Scream server example: "hi" -> "HI!!!" 
var server = ws.createServer(function (conn) {

	console.log("New connection")

	if (conn01 == null) {
		console.log ("Assigning connection to conn01");
		conn01 = conn;

		conn01.on("text", function (str) {
			console.log("Received on conn01, sending to conn02:" + str);
			if (conn01 != null) {
				conn02.sendText(str);
			}
		});

		conn01.on("close", function (code, reason) {
			console.log("conn01 closed")
			conn01 = null;
		});
	} 
	else if (conn02 == null) {
		console.log ("Assigning connection to conn02");
		conn02 = conn;
	
		conn02.on("text", function (str) {
			console.log("Received on conn02, sending to conn01:" + str);
			if (conn01 != null) {
				conn01.sendText(str);
			}
		});

		conn02.on("close", function (code, reason) {
			console.log("conn02 closed")
			conn02 = null;
		});
	}
	else {
		console.log("TOO MANY CONNECTIONS FOR ME :(");
		conn.close();
	}


}).listen(8001)
