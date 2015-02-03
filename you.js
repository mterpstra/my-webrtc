'use strict';

var constraints, video, streamToAttach, peerConnection, youVideo, guestVideo

function createPeerConnection() 
{
	peerConnection = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
	peerConnection.onicecandidate = onIceCandidate;
	peerConnection.onaddstream = onAddStream;
	peerConnection.addStream (streamToAttach);
	peerConnection.createOffer(onCreateOfferSuccess, onCreateOfferError, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });
}


function onCreateOfferSuccess(sessionDescription)
{
	peerConnection.setLocalDescription(sessionDescription);
	socket.send(JSON.stringify(sessionDescription));
}

function onYouVideoSuccess(stream) {
	console.log("onYouVideoSuccess()", stream);
	youVideo.src = window.URL.createObjectURL(stream);
	streamToAttach = stream;
	createPeerConnection();
}

function onYouVideoError(error)
{
	console.log("onYouVideoError():", error);
}

function onGuestAnswerReceived(guestanswer)
{
	console.log("guestanswer", guestanswer);
	peerConnection.setRemoteDescription(new RTCSessionDescription(guestanswer));
}

function init() 
{
	socketInit();
	youVideo = document.getElementById("youVideo");
	guestVideo = document.getElementById("guestVideo");
	constraints = { audio: true, video: true };
	navigator.webkitGetUserMedia(constraints, onYouVideoSuccess, onYouVideoError);
}

