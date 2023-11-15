'use strict';

import DID_API from './api.json' assert { type: 'json' };
if (DID_API.key == '🤫') alert('Please put your api key inside ./api.json and restart..')

const RTCPeerConnection = (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection).bind(window);

let peerConnection;
let streamId;
let sessionId;
let sessionClientAnswer;
let conversationHistory = [];

let didMode = true;

const talkVideo = document.getElementById('talk-video');
talkVideo.setAttribute('playsinline', '');
const peerStatusLabel = document.getElementById('peer-status-label');
const iceStatusLabel = document.getElementById('ice-status-label');
const iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
const signalingStatusLabel = document.getElementById('signaling-status-label');

const connectButton = document.getElementById('connect-button');
const imgButton = document.getElementById('img-button');
const uploadButton = document.getElementById('upload-button');
let talkResponse;

let uploadImgUrl;
let uploadImgResponse;

//chatgpt
function appendProductToPage(id, name, summary, cost,details,reason) {
  var hiddenElement =  document.getElementsByName('product')[0].cloneNode(true);
    hiddenElement.getElementsByClassName("name")[0].innerText = name;
  hiddenElement.getElementsByClassName("summary")[0].innerText = summary;
    hiddenElement.getElementsByClassName("cost")[0].innerText = cost;
	  //hiddenElement.getElementsByClassName("age")[0].innerText = age;
	  	  hiddenElement.getElementsByClassName("moreDetails")[0].addEventListener('click', function(e) {
   displayProductDetailsAndReason(name, details,reason);
}); 
	    //hiddenElement.getElementsByClassName("guarantee")[0].innerText = guarantee;
  var productPlaceholder = document.getElementById('product'+id);   
    hiddenElement.style.display = ''; // Show the hidden element
    productPlaceholder.appendChild(hiddenElement);
}
function appendTableToPage(id,age, guarantee) {
  var hiddenElement =  document.getElementsByName('productTable')[0].cloneNode(true);
  //  hiddenElement.getElementsByClassName("name")[0].innerText = name;
  //hiddenElement.getElementsByClassName("summary")[0].innerText = summary;
   // hiddenElement.getElementsByClassName("cost")[0].innerText = cost;
	  hiddenElement.getElementsByClassName("age")[0].innerText = age;
	//  	  hiddenElement.getElementsByClassName("moreDetails")[0].addEventListener('click', function(e) {
   //displayProductDetailsAndReason(name, details,reason);
//}); 
	    hiddenElement.getElementsByClassName("guarantee")[0].innerText = guarantee;
  var productPlaceholder = document.getElementById('table'+id);   
    hiddenElement.style.display = ''; // Show the hidden element
    productPlaceholder.appendChild(hiddenElement);
}


//chatgpt
async function displayProductDetailsAndReason(name, details,reason) {
	await talkCustom(reason);
	updateConversation("",details);
}

//chatgpt
function appendServiceChoiceToConversation() {
  var hiddenElement = document.getElementById('serviceChoiceElement');
  var conversationElement = document.getElementById('conversation');

  if (hiddenElement && conversationElement) {
    hiddenElement.style.display = ''; // Show the hidden element
    conversationElement.appendChild(hiddenElement);
  }
}
function appendServiceChoiceEngToConversation() {
  var hiddenElement = document.getElementById('serviceChoiceElementEng');
  var conversationElement = document.getElementById('conversation');

  if (hiddenElement && conversationElement) {
    hiddenElement.style.display = ''; // Show the hidden element
    conversationElement.appendChild(hiddenElement);
  }
}
//chatgpt
function appendInsuranceChoiceToConversation() {
  var hiddenElement = document.getElementById('insuranceChoiceElement');
  var conversationElement = document.getElementById('conversation');

  if (hiddenElement && conversationElement) {
    hiddenElement.style.display = ''; // Show the hidden element
    conversationElement.appendChild(hiddenElement);
  }
}

function disableChat(){
	document.getElementById("questionInput").disabled = true;
	document.getElementById('send').disabled = true;
}
function recommendPackageClickHandler(){
		console.log("R");
      recommendPackage();
	
}
function enableChat(){
	document.getElementById("questionInput").disabled = false;
	document.getElementById('send').disabled = false;
	document.getElementById('send').addEventListener('click', recommendPackageClickHandler);
}

function enableAskQuestions(){
		document.getElementById('send').removeEventListener('click', recommendPackageClickHandler);
	document.getElementById('send').addEventListener('click', function() {
	console.log("askask");
      askQuestion();
    });
} 

function clearChat(){	
	document.getElementById("questionInput").value = "";
}

function updateConversation(prompt, response) {
	console.log("HI");
  const conversationElement = document.getElementById('conversation');
  const promptElement = document.createElement('p');
  const responseElement = document.createElement('p');
  promptElement.innerText = prompt;
  responseElement.innerText = response;
    promptElement.style.textAlign = 'left';
  responseElement.style.textAlign = 'left';
  promptElement.style.marginRight = '20px'; // Optional: add some spacing between prompt and response
  promptElement.style.fontWeight = 'bold'; // Optional: make prompt text bold
  promptElement.style.fontSize = '11px';
  responseElement.style.fontSize = '11px';
  promptElement.style.color = '#000'; // Optional: set prompt text color
  responseElement.style.color = '#000'; // Optional: set response text color
  
promptElement.style.width = '100%'; // Set the  width
//promptElement.style.wordWrap = 'break-word'; // Break long words onto the next line
promptElement.style.maxWidth = '100%'; // Set the maximum width
//promptElement.style.maxWidth = '500px'; // Set the maximum width
promptElement.style.wordBreak = 'normal'; // Break long words

responseElement.style.width = '100%'; // Set the  width
//responseElement.style.wordWrap = 'break-word'; // Break long words onto the next line
responseElement.style.maxWidth = '100%'; // Set the maximum width
responseElement.style.wordBreak = 'normal'; // Break long words
  
// Style for prompt element
promptElement.style.background = '#e0b9e0'; // Set the background to grey
promptElement.style.border = '2px solid purple';
promptElement.style.padding = '10px';
//promptElement.style.float = 'right'; // Align the entire box to the left - float will mess up alignment

// Style for response element
responseElement.style.background = '#eeeeee'; // Set the background to grey
responseElement.style.border = '2px solid grey';
responseElement.style.padding = '10px';
//responseElement.style.float = 'left'; // Align the entire box to the left

if (prompt != "")
{ 

conversationElement.appendChild(promptElement);

} else {
	responseElement.style.width = '100%'; // Set the  width
	responseElement.style.maxWidth = '100%';
	responseElement.style.float = ''; // if no prompt, put response in the center
	
}

if (response != "")
{ 

conversationElement.appendChild(responseElement);

} else {
	
}


  
  conversationElement.scrollTop = conversationElement.scrollHeight;
} 


function isChinese(text) {
  var chinesePattern = /[\u4e00-\u9fff]/; // Unicode range for Chinese characters
  return chinesePattern.test(text);
}

function isEnglish(text) {
  var englishPattern = /^[a-zA-Z\s]+$/; // English alphabet and spaces
  return englishPattern.test(text);
}


async function uploadMultiple() {
	console.log("SSS");
  const fileInput = document.getElementById('policies');
  const files = fileInput.files;
  
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    formData.append('pdfs[]', file, encodeURIComponent(file.name));
  }
  formData.append('coverage', document.getElementById("coverage").value);
    formData.append('policy', document.getElementById("policy").value);
  document.getElementById('formSpinner').style.display = 'block';
  try {
    const response = await fetch('/uploadMultiplePolicyDocs', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
		console.log("res opk");
		const data = await response.json(); // Parse the JSON response
		console.log("DATA " + data.toString());
		console.log(data.extracted1);
		if (data.extracted) {
			document.getElementById('formSpinner').style.display = 'none';
			//alert('PDF uploaded and processed successfully.');
		    console.log(data.extracted);
		  // Use data.extractedFields to update fields
		  for (const key in data.extracted) {
			  //if (dictionary.hasOwnProperty(key)) {
				  document.getElementById(key).value = data.extracted[key];
				//const value = dictionary[key];
				//console.log(`Key: ${key}, Value: ${value}`);
			  //}
			}
		}

      //alert(data.message); // Display the message from the response
      //alert('PDFs uploaded and processed successfully.');
      //await fetchDataAndPopulateTable();
      // Optionally, you can reload the page or update the table with the latest data.
    } else {
      alert('Error uploading PDFs.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error uploading PDFs.');
  }
}


async function uploadImg(){
	
	if (didMode){
	
	console.log("UPLOADING ");
	 
	 
	 //const imagePath = 'pic.png';
  // Create a new FormData object and append the specified image
  //var form = new FormData();
  //form.append('image', new File([new Blob()], imagePath));
	//console.log("U");
	
	
   var file = document.getElementById("myfile").files[0];
    var form = new FormData();
    form.append('image', file);

	console.log(`Basic ${DID_API.key}`)
	const options = {
	  method: 'POST',
	  headers: {
		'accept': 'application/json',
		'authorization': `Basic ${DID_API.key}`
	  }
	};
	options.body = form;
    
    await fetch("https://api.d-id.com/images", options)
       .then(response => response.json())
	  .then(response => uploadImgResponse = response)
	  .then(data => {
         console.log(data);
		uploadImgUrl = data.url;
		console.log(uploadImgUrl);
		document.getElementById('connect-button').style.backgroundColor = 'green';
      })
	  .catch(err => console.error(err));
	  
	  //console.log(uploadImgUrl);
	  
	  //await connect();
	  //await talkCustom("Hi, I'm your Insurance Digital Consultant");
	  
	  
	} else {
		var language   = document.getElementById("currentLanguage").innerText ;

if(language	 == "Chinese"){
		updateConversation("","我是您的智能保险助手。我可以如何协助您？");
		appendServiceChoiceToConversation();
	} else {
		updateConversation("","I am your Intelligent Insurance Assistant, how may I assist you？");
		appendServiceChoiceEngToConversation();
	}
	}
	//updateConversation("","I'm your Intelligent Insurance Assistant. How may I assist you?");
	//  appendServiceChoiceToConversation();
}

uploadButton.onclick = async () => {
	//updateConversation("","I'm your Intelligent Insurance Assistant. How may I assist you?");
	 

	console.log("UUU");
	uploadImg();
}


export async function restart(){
		var hiddenElement = document.getElementById('speechBubble');
    hiddenElement.style.display = 'None'; // Show the hidden element
		clearChatHistory();
	await destroy();

	await connect();
}

export async function showInsuranceOptions(){
	 await talkCustom("Choose an insurance category from the suggested list below or type in your own.");
		updateConversation("","Choose an insurance category from the suggested list below or type in your own.");
	 appendInsuranceChoiceToConversation();	
	
}

export async function getMoreInfo(){
var language   = document.getElementById("currentLanguage").innerText ;

if(language	 == "Chinese"){
	await talkCustom("为了为您提供合适的医疗保险产品，我需要更多信息。");
		updateConversation("","为了为您提供合适的医疗保险产品，请提供以下信息：性别、年龄、年收入、医疗历史和非流动资产。");
}else {
		await talkCustom("In order to recommend the most suitable medical insurance	products, I'm going to need more information");
		updateConversation("","In order to recommend the most suitable medical insurance products, please provide me with your gender, age, annual income, medical history and non-liquid assets.");
}

	 //appendInsuranceChoiceToConversation();	
	   var hiddenElement = document.getElementById('products');

  if (hiddenElement ) {
    hiddenElement.style.display = ''; // Show the hidden element
  }
  enableChat();
}

connectButton.onclick = async () => {
	connect();
}

async function connect(){
	var language   = document.getElementById("currentLanguage").innerText ;

	//disableChat();
		if (didMode){
		console.log("CONNECTING ");

  if (peerConnection && peerConnection.connectionState === 'connected') {
    return;
  }

  stopAllStreams();
  closePC();
	//API - update image!!!
	//https://docs.d-id.com/reference/upload-an-image
  console.log(`Basic ${DID_API.key}`);
    console.log(`${DID_API.url}/talks/streams`);
  const sessionResponse = await fetch(`${DID_API.url}/talks/streams`, {
    method: 'POST',
    headers: {'Authorization': `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      source_url: "https://jack-insurancedemo4.onrender.com/insuranceHelperChatbot/pic2.png"
    }),   
  });
//source_url: uploadImgUrl
  
  const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json()
  streamId = newStreamId;
  sessionId = newSessionId;
  
  try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
  } catch (e) {
    console.log('error during streaming setup', e);
    stopAllStreams();
    closePC();
    return;
  }

  const sdpResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`,
    {
      method: 'POST',
      headers: {Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({answer: sessionClientAnswer, session_id: sessionId})
    });
	
	
	uploadButton.style.display = 'None';
	
	if (language == "Chinese"){
		await talkCustom("我是您的智能保险助手。我可以如何协助您？");
		updateConversation("","我是您的智能保险助手。我可以如何协助您？");
		appendServiceChoiceToConversation();
	} else {
		await talkCustom("I am your Intelligent Insurance Assistant, how may I assist you？");
		updateConversation("","I am your Intelligent Insurance Assistant, how may I assist you？");
		appendServiceChoiceEngToConversation();
	}
	
	
	}

	
	
	
}


function clearChatHistory(){
  const conversationElement = document.getElementById('conversation');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
}

//const talkButton = document.getElementById('talk-button');

async function talkCustom(content) {
	
	if (didMode){
	console.log("talku!"+content);
	
  // connectionState not supported in firefox
  if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
	  console.log("talku!2"+content);
	   
	var language   = document.getElementById("currentLanguage").innerText ;

	var voiceID = "";
	//https://speech.microsoft.com/portal/voicegallery
	if (language=="Chinese"){
		voiceID = "zh-CN-XiaochenNeural";
	}else{
			voiceID = "en-US-JennyNeural";
	}
	//voiceID = "en-US-JennyNeural";
	
	
    talkResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'script': {
            "type": "text",
                "provider": {
                    "type": "microsoft",
                    "voice_id": voiceID
                },
				"ssml": "false",
                "input": content
          },
          'driver_url': 'bank://lively/',
          'config': {
            'stitch': true,
          },
          'session_id': sessionId
        })
      });  
	}
	console.log(talkResponse);
	
   
	
	}


	try{
	var hiddenElement = document.getElementById('speechBubble');
    hiddenElement.style.display = ''; // Show the hidden element
	hiddenElement.innerText = content;
} catch (e){}
}
	
  export async function askQuestion() {
	  console.log("ASJSSS");
		
		  document.getElementById('askSpinner').style.display = 'block';
		var clientAnswer = document.getElementById("questionInput").value;
		updateConversation(clientAnswer,"");
		clearChat();
		//await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");
		
		var language   = document.getElementById("currentLanguage").innerText ;
        //const response = await fetch(`/generateEmail?language=${encodeURIComponent(language)}`
		//const response = await fetch(`/recommendPackages?clientAnswer=${encodeURIComponent(clientAnswer)}&language=${

		const response = await fetch(`/answerQuestion?clientAnswer=${encodeURIComponent(clientAnswer)}&language=${encodeURIComponent(language)}`, {
		  method: 'POST',
		});

	    console.log(response);
		var responseTxt = await response.text();
			    console.log(responseTxt);
	   

		  document.getElementById('askSpinner').style.display = 'None';
		updateConversation("", responseTxt);
		//await talkCustom(responseTxt);
	
	}
	
	  export async function askInsuranceQuestion() {
	  console.log("ASJSSS");
		 var language   = document.getElementById("currentLanguage").innerText ;
		  document.getElementById('askSpinner').style.display = 'block';
		var clientAnswer = document.getElementById("questionInput").value;
		updateConversation(clientAnswer,"");
		clearChat();
		//await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");


		
		const response = await fetch(`/answerInsuranceQuestion?clientAnswer=${encodeURIComponent(clientAnswer)}&language=${encodeURIComponent(language)}`, {
		  method: 'POST',
		});

	    console.log(response);
		var responseTxt = await response.text();
			    console.log(responseTxt);
	   

		  document.getElementById('askSpinner').style.display = 'None';
		updateConversation("", responseTxt);
		await talkCustom(responseTxt);
	
	}


export async function recommendPackage() {
		

	
		  document.getElementById('askSpinner').style.display = 'block';
	
		var clientAnswer = document.getElementById("questionInput").value;
		
		updateConversation(clientAnswer,"");
		clearChat();
		//await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");
		 var language   = document.getElementById("currentLanguage").innerText ;

        //const response = await fetch(`/generateEmail?language=${encodeURIComponent(language)}`
		const response = await fetch(`/recommendPackages?clientAnswer=${encodeURIComponent(clientAnswer)}&language=${encodeURIComponent(language)}`, {
		  method: 'POST',
		});

	    console.log(response);
		var responseTxt = await response.text();
			    console.log(responseTxt);
		//responseTxt = responseTxt.match(/\{[\s\S]*?\}/)[0];
	   
	   
	   var items = eval(responseTxt); //use eval instead of json.parse for [ ] json data (can use parse for { } )
		for (var x = 0; x < items.length; x++) {
			console.log(items[x].Name);
			//function appendProductToPage(id, name, summary, cost, guarantee,details,reason) {
			appendProductToPage(x+1,items[x]['Name'],items[x]['Summary'],items[x]['Cost'],items[x]['Details'],items[x]['Reason']);
			appendTableToPage(x+1, items[x]['Insured Age Range'],items[x]['Guarantee Period']);
		}
		
		  document.getElementById('askSpinner').style.display = 'None';
		  if(language=="Chinese"){
		updateConversation("", "根据您的回答，以下是最适合您的医疗保险产品。点击产品以获取更多详细信息");
		await talkCustom("以下是推荐的产品，请点击产品了解更多信息，同时也可以随时提出您自己的问题。");
		  }else{
		  			updateConversation("", "According to your response, here are the most suitable Medical Insurance Products. Click 'More Details' to understand more about each product");
		await talkCustom("Here are the most suitable products, click More Details to understand more. Feel free to also ask your own questions.");
		  }

		
		enableAskQuestions();
	
}

export async function recommendPackage2(product) {
	var clientAnswer = document.getElementById("questionInput").value;
	var options = document.getElementById("medicalInsuranceOptions").innerText;
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner. You have asked the client about their Gender, Age, Annual Income, and Non-liquid Assets. Client has replied with " + clientAnswer + ", and has chosen the following product "+product+". Based on the medical insurance product options below, write a short analysis on how their gender, age, annual income and assets suits their chosen product (be concise). The products are as follows: "+options;

  // Call ChatGPT API to get the response
	const headers = {
	  "Content-Type": "application/json",
	  "Authorization": "Bearer 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"
	};

	const data = JSON.stringify({
	  messages: [{"role": "user", "content": prompt}],
	  model: "gpt-4-1106-preview",
	  temperature: 0.7,
	  max_tokens: 550
	});

	console.log(prompt);
	fetch("https://api.openai.com/v1/chat/completions", {
	  method: "POST",
	  headers: headers,
	  body: data
	})
	.then(response => response.json())
	.then(data => {
		console.log(data);
	  const response = data.choices[0].message.content;
	  console.log(response);
	  updateConversation(clientAnswer, response)
	  //updateConversation(prompt, response);
	  
	})
	.catch(error => console.error(error));
	
	
	
  }





async function talk() {
// connectionState not supported in firefox
  if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
	  
	    const promptInput = document.getElementById('prompt-input');
  const prompt = promptInput.value;
  
  // Call ChatGPT API to get the response
	const headers = {
	  "Content-Type": "application/json",
	  "Authorization": "Bearer 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"
	};

	const data = JSON.stringify({
	  messages: [{"role": "user", "content": prompt}],
	  model: "gpt-3.5-turbo",
	  temperature: 0.7,
	  max_tokens: 50
	});

	console.log(prompt);
	fetch("https://api.openai.com/v1/chat/completions", {
	  method: "POST",
	  headers: headers,
	  body: data
	})
	.then(response => response.json())
	.then(data => {
		console.log(data);
	  const response = data.choices[0].message.content;
	  console.log(response);
	  
	  updateConversation(prompt, response);
	  //d-id  voices are here https://speech.microsoft.com/portal/voicegallery
	  //chinese voice zh-CN-YunyeNeural
	  //english en-US-BrandonNeural
	
	var voiceID = "";
	console.log("CHINESE ? " + isChinese(response));
	if(isChinese(response)){
		//voiceID = "zh-CN-YunyeNeural";
		voiceID = "zh-CN-YunyeNeural";
	} else {
		voiceID = "en-US-BrandonNeural";
	}
	
    const talkResponse = fetch(`${DID_API.url}/talks/streams/${streamId}`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'script': {
            "type": "text",
                "provider": {
                    "type": "microsoft",
                    "voice_id": voiceID
                },
				"ssml": "false",
                "input": response
          },
          'driver_url': 'bank://lively/',
          'config': {
            'stitch': true,
          },
          'session_id': sessionId
        })
      });
	  
	  
	})
	.catch(error => console.error(error));
	
	
	
  }}

const destroyButton = document.getElementById('destroy-button');

destroyButton.onclick = async () => {
	//updateConversation("","I'm your Intelligent Insurance Assistant. How may I assist you?");
	 

	console.log("UUU");
	destroy();
}

async function destroy() {
	try{
  await fetch(`${DID_API.url}/talks/streams/${streamId}`,
    {
      method: 'DELETE',
      headers: {Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({session_id: sessionId})
    });

  stopAllStreams();
  closePC();
} catch (e){
	
}
}

function onIceGatheringStateChange() {
  console.log("iceGatheringState = "+peerConnection.iceGatheringState);
  iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
  iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
}
function onIceCandidate(event) {
  console.log('onIceCandidate', event);

  if (event.candidate) {
    const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
      console.log('Portss:', event.candidate);
    fetch(`${DID_API.url}/talks/streams/${streamId}/ice`,
      {
        method: 'POST',
        headers: {Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({ candidate, sdpMid, sdpMLineIndex, session_id: sessionId})
      }); 
  }
}
function onIceConnectionStateChange() {
	  	console.log("iceConnectionState = "+peerConnection.iceConnectionState);
  iceStatusLabel.innerText = peerConnection.iceConnectionState;
  iceStatusLabel.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
  if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
    stopAllStreams();
    closePC();
  }
}
function onConnectionStateChange() {
  // not supported in firefox
  	console.log("onConnectionStateChange = "+peerConnection.connectionState);
  peerStatusLabel.innerText = peerConnection.connectionState;
  peerStatusLabel.className = 'peerConnectionState-' + peerConnection.connectionState;
}
function onSignalingStateChange() {
	console.log("onsignal = "+peerConnection.signalingState);
  signalingStatusLabel.innerText = peerConnection.signalingState;
  signalingStatusLabel.className = 'signalingState-' + peerConnection.signalingState;
}
function onTrack(event) {
  const remoteStream = event.streams[0];
  setVideoElement(remoteStream);
}

async function createPeerConnection(offer, iceServers) {
	console.log("Creating peer connection ");
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection({iceServers});
    peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    peerConnection.addEventListener('icecandidate', onIceCandidate, true);
    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
    peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
    peerConnection.addEventListener('track', onTrack, true);
  }

  await peerConnection.setRemoteDescription(offer);
  console.log('set remote sdp OK');

  const sessionClientAnswer = await peerConnection.createAnswer();
  console.log('create local sdp OK');

  await peerConnection.setLocalDescription(sessionClientAnswer);
  console.log('set local sdp OK');

  return sessionClientAnswer;
}

function setVideoElement(stream) {
  if (!stream) return;
  talkVideo.srcObject = stream;

  // safari hotfix
  if (talkVideo.paused) {
    talkVideo.play().then(_ => {}).catch(e => {});
  }
}

function stopAllStreams() {
  if (talkVideo.srcObject) {
    console.log('stopping video streams');
    talkVideo.srcObject.getTracks().forEach(track => track.stop());
    talkVideo.srcObject = null;
  }
}

function closePC(pc = peerConnection) {
  if (!pc) return;
  console.log('stopping peer connection');
  pc.close();
  pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
  pc.removeEventListener('icecandidate', onIceCandidate, true);
  pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
  pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
  pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
  pc.removeEventListener('track', onTrack, true);
  iceGatheringStatusLabel.innerText = '';
  signalingStatusLabel.innerText = '';
  iceStatusLabel.innerText = '';
  peerStatusLabel.innerText = '';
  console.log('stopped peer connection');
  if (pc === peerConnection) {
    peerConnection = null;
  }
}
async function main()
{
	//await uploadImg();
	await connect();

}

//for them to be visible to html / js!!!!!



console.log("UUU");
main();