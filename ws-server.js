var ws = require("nodejs-websocket")


var connections;

var conn01 = null, 
    conn02 = null;

function S4() {
	    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
function guid()
{
	guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	return guid;
}

function onDisconnect(guid) 
{
	connections[guid].close();
}
  
// Scream server example: "hi" -> "HI!!!" 
var server = ws.createServer(function (conn) {

	var newguid = guid();
	console.log("New connection:", newguid)

	connections[guid] = conn;

	conn.on("text", function (str, guid) {
		console.log("Received from " + guid + ": " + str);
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
