
/////////////////////////////////////////////////////////////////////////////////////
// Common Websocket Stuff
/////////////////////////////////////////////////////////////////////////////////////
var socket, constraints, video, streamToAttach, peerConnection, youVideo, guestVideo;

function onSocketMessage(event)
{
	var msg = JSON.parse(event.data);
	switch(msg.type)
	{
		case "offer":
			onOfferReceived(msg);
		break;

		case "answer":
			onAnswerReceived(msg);
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
	socket = new WebSocket("ws://10.252.20.84:8001");
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

function onOfferReceived(jsonoffer) 
{
	var newSessionDescription = new RTCSessionDescription(jsonoffer);
	peerConnection.setRemoteDescription(newSessionDescription, onSetRemoteDescriptionSuccess, onSetRemoteDescriptionError);
}

function onAnswerReceived(guestanswer)
{
	peerConnection.setRemoteDescription(new RTCSessionDescription(guestanswer));
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
		console.log("The stream started flowing!");
	} 
	else setTimeout(waitUntilRemoteStreamStartsFlowing, 50);
}

function onYouVideoSuccess(stream) {
	youVideo.src = window.URL.createObjectURL(stream);
	streamToAttach = stream;
	createPeerConnection();
}

function onYouVideoError(error)
{
	console.log("onYouVideoError():", error);
}

function onCreateAnswerSuccess(answer)
{
	peerConnection.setLocalDescription(answer);
	socket.send(JSON.stringify(answer));
}

function onCreateAnswerError(error)
{
	console.log("onCreateAnswerError", error);
}

function onSetRemoteDescriptionSuccess() 
{
	peerConnection.createAnswer(onCreateAnswerSuccess, onCreateAnswerError);
}

function onSetRemoteDescriptionError(error) 
{
	console.log("onSetRemoteDescriptionError", error);
}


/////////////////////////////////////////////////////////////////////////////////////
// Common Initialization stuff
/////////////////////////////////////////////////////////////////////////////////////
function init() 
{
	socketInit();
	youVideo = document.getElementById("youVideo");
	guestVideo = document.getElementById("guestVideo");
	constraints = { audio: false, video: true };
	navigator.webkitGetUserMedia(constraints, onYouVideoSuccess, onYouVideoError);
}


