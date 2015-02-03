'use strict';

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
	peerConnection.setLocalDescription(sessionDescription);
	//socket.send(JSON.stringify(sessionDescription));
}

function onYouVideoSuccess(stream) {
	console.log("onGuestVideoSuccess()", stream);
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
	console.log("onCreateAnswerSuccess", answer);
	peerConnection.setLocalDescription(answer);
	console.log("My Answer needs to go back to the other person");
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


function init() 
{
	socketInit();
	youVideo = document.getElementById("youVideo");
	guestVideo = document.getElementById("guestVideo");
	constraints = { audio: true, video: true };
	navigator.webkitGetUserMedia(constraints, onYouVideoSuccess, onYouVideoError);
}

