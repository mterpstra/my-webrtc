
/////////////////////////////////////////////////////////////////////////////////////
// Common Websocket Stuff
/////////////////////////////////////////////////////////////////////////////////////
var socket;

function onSocketMessage(event)
{
	var msg = JSON.parse(event.data);
	switch(msg.type)
	{
		case "offer":
			onOfferReceived(msg);
		break;

		case "answer":
			onGuestAnswerReceived(msg);
		break;

		case "my-ice":
			peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
		break;

		default:
			console.log("unhandled msg!!!", msg.type);
			break;
	}
}

function socketInit()
{
	socket = new WebSocket("ws://10.252.57.84:8001");
	socket.onmessage = onSocketMessage;
	return socket;
}






/////////////////////////////////////////////////////////////////////////////////////
// Common WebRTC Stuff
/////////////////////////////////////////////////////////////////////////////////////
function onIceCandidate(event) 
{
	if (!peerConnection || !event || !event.candidate) return;
	var candidate = event.candidate;
	var msg = {"type":"my-ice", "candidate":candidate};
	socket.send(JSON.stringify(msg));
}

function onCreateOfferError(error)
{
	console.log("onCreateOfferError", error);
}

function onAddStream(event) 
{
	if (!event) return;
	guestVideo.src = webkitURL.createObjectURL(event.stream);
	waitUntilRemoteStreamStartsFlowing();
}

function waitUntilRemoteStreamStartsFlowing()
{
	console.log("waitUntilRemoteStreamStartsFlowing()");
	if (!(guestVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || guestVideo.paused || guestVideo.currentTime <= 0)) {
		console.log("The remote stream started flowing, supposedly..");
		// remote stream started flowing!
	} 
	else setTimeout(waitUntilRemoteStreamStartsFlowing, 50);
}
