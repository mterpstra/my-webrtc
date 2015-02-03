'use strict';

console.log("Starting my webrtc script");


var constraints, video, streamToAttach, peerConnection, youVideo, guestVideo



function createPeerConnection() 
{
	peerConnection = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
	peerConnection.onicecandidate = onIceCandidate;
	peerConnection.onaddstream = onAddStream;
	peerConnection.addStream (streamToAttach);
	peerConnection.createOffer(onCreateOfferSuccess, onCreateOfferError, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });
	console.log("peerConnection", peerConnection);
}


function onCreateOfferSuccess(sessionDescription)
{
	console.log("onCreateOfferSuccess", sessionDescription);
	peerConnection.setLocalDescription(sessionDescription);
	document.getElementById("myoffer").value = JSON.stringify(sessionDescription);
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
	// POST-ICE-to-other-Peer(candidate.candidate, candidate.sdpMLineIndex);
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
		 console.log("remote stream started flowing!");
	} 
	else setTimeout(waitUntilRemoteStreamStartsFlowing, 50);
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

function onGuestAnswerButtonClick(event)
{
	var guestanswer = document.getElementById("guestanswer-textarea").value;
	guestanswer = JSON.parse(guestanswer);
	console.log("guestanswer", guestanswer);

	peerConnection.setRemoteDescription(new RTCSessionDescription(guestanswer));
}

function init() 
{
	console.log("my init function");
	youVideo = document.getElementById("youVideo");
	guestVideo = document.getElementById("guestVideo");
	constraints = { audio: false, video: true };
	navigator.webkitGetUserMedia(constraints, onYouVideoSuccess, onYouVideoError);


	document.getElementById("guestanswer-button").onclick = onGuestAnswerButtonClick;
}

