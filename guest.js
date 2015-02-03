'use strict';

console.log("Starting my webrtc script");


var constraints, video, streamToAttach, peerConnection, youVideo, guestVideo



function createPeerConnection() 
{
	peerConnection = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
	peerConnection.onicecandidate = onIceCandidate;
	peerConnection.onaddstream = onAddStream;
	peerConnection.addStream (streamToAttach);
	//peerConnection.createOffer(onCreateOfferSuccess, onCreateOfferError, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });
}


function onCreateOfferSuccess(sessionDescription)
{
	console.log("onCreateOfferSuccess", sessionDescription);
	peerConnection.setLocalDescription(sessionDescription);
}

function onCreateOfferError(error)
{
	console.log("onCreateOfferError", error);
}

function onIceCandidate(event) 
{
	console.log("onIceCandidate", event);
	if (!peerConnection || !event || !event.candidate) return;
	var candidate = event.candidate;
	var msg = {"type":"my-ice", "candidate":candidate};
	socket.send(JSON.stringify(msg));
}


function onAddStream(event) 
{
	console.log("onAddStream", event);
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




function onGuestVideoSuccess(stream) {
	console.log("onGuestVideoSuccess()", stream);
	guestVideo.src = window.URL.createObjectURL(stream);
	streamToAttach = stream;
	createPeerConnection();
}

function onGuestVideoError(error)
{
	console.log("onYouVideoError():", error);
}


function onCreateAnswerSuccess(answer)
{
	console.log("onCreateAnswerSuccess", answer);
	peerConnection.setLocalDescription(answer);
	//socket.emit('msg', { by: currentId, to: data.by, sdp: sdp, type: 'sdp-answer' });
	console.log("My Answer needs to go back to the other person");
	//document.getElementById("guestanswer-textarea").value = JSON.stringify(answer);
	socket.send(JSON.stringify(answer));
}

function onCreateAnswerError(error)
{
	console.log("onCreateAnswerError", error);
}


function onSetRemoteDescriptionSuccess() 
{
	console.log("onSetRemoteDescriptionSuccess");
	peerConnection.createAnswer(onCreateAnswerSuccess, onCreateAnswerError);
}

function onSetRemoteDescriptionError(error) 
{
	console.log("onSetRemoteDescriptionError", error);
}

function onOfferReceived(jsonoffer) 
{
	var newSessionDescription = new RTCSessionDescription(jsonoffer);
	console.log("newSessionDescription:", newSessionDescription);
	peerConnection.setRemoteDescription(newSessionDescription, onSetRemoteDescriptionSuccess, onSetRemoteDescriptionError);
}

function onSocketMessage(event)
{
	console.log("I have a socket message:", event);
	var msg = JSON.parse(event.data);
	console.log("type:", msg.type);
	switch(msg.type)
	{
		case "offer":
			onOfferReceived(msg);
		break;

		case "my-ice":
			peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
		break;

		default:
			console.log("unhandled msg!!!", msg.type);
		break;
	}
}


var socket;

function init() 
{
	socket = new WebSocket("ws://10.252.57.84:8001");
	socket.onmessage = onSocketMessage;
	guestVideo = document.getElementById("guestVideo");
	constraints = { audio: false, video: true };
	navigator.webkitGetUserMedia(constraints, onGuestVideoSuccess, onGuestVideoError);
}

