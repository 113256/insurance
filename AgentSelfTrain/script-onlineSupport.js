
let conversationHistory = [];
let chosenType = "";



function clearChat(){	
	document.getElementById("questionInput").value = "";
}
function disableChat(){
	document.getElementById("questionInput").disabled = true;
	document.getElementById('send').disabled = true;
}

function updateConversation(prompt, response) {
	console.log("HI");
  const conversationElement = document.getElementById('conversation');
  const promptElement = document.createElement('p');
  const responseElement = document.createElement('p');
  promptElement.innerText = prompt;
  responseElement.innerText = response;
    //promptElement.style.textAlign = 'right';
  //responseElement.style.textAlign = 'left';
  promptElement.style.marginRight = '20px'; // Optional: add some spacing between prompt and response
  promptElement.style.fontWeight = 'bold'; // Optional: make prompt text bold
  promptElement.style.fontSize = '11px';
  responseElement.style.fontSize = '11px';
  promptElement.style.color = '#000'; // Optional: set prompt text color
  responseElement.style.color = '#000'; // Optional: set response text color
  
promptElement.style.width = '90%'; // Set the  width
//promptElement.style.wordWrap = 'break-word'; // Break long words onto the next line
promptElement.style.maxWidth = '500px'; // Set the maximum width
promptElement.style.wordBreak = 'normal'; // Break long words

responseElement.style.width = '90%'; // Set the  width
//responseElement.style.wordWrap = 'break-word'; // Break long words onto the next line
responseElement.style.maxWidth = '500px'; // Set the maximum width
responseElement.style.wordBreak = 'normal'; // Break long words
  
// Style for prompt element
promptElement.style.background = '#e0b9e0'; // Set the background to grey
promptElement.style.border = '2px solid purple';
promptElement.style.padding = '10px';
promptElement.style.float = ''; // Align the entire box to the left

// Style for response element
responseElement.style.background = '#eeeeee'; // Set the background to grey
responseElement.style.border = '2px solid grey';
responseElement.style.padding = '10px';
responseElement.style.float = ''; // Align the entire box to the left

if (prompt != "")
{ 

conversationElement.appendChild(promptElement);

} else {
	
}

if (response != "")
{ 

conversationElement.appendChild(responseElement);

} else {
	
}


  //conversationElement.appendChild(responseElement);
  conversationElement.scrollTop = conversationElement.scrollHeight;
} 


function appendClassChoiceToConversation() {
  var hiddenElement = document.getElementById('trainingChoice');
  var conversationElement = document.getElementById('conversation');

  if (hiddenElement && conversationElement) {
    hiddenElement.style.display = ''; // Show the hidden element
    conversationElement.appendChild(hiddenElement);
  }
}

function recommendPackageClickHandler(){
		console.log("R");
      recommendTraining();
	
}
function enableChat(){
	document.getElementById("questionInput").disabled = false;
	document.getElementById('send').disabled = false;
	document.getElementById('send').addEventListener('click', recommendPackageClickHandler);
}


function appendTrainingToPage(id, title, summary) {
  var hiddenElement =  document.getElementsByName('class')[0].cloneNode(true);
    hiddenElement.getElementsByClassName("name")[0].innerText = title;
  hiddenElement.getElementsByClassName("summary")[0].innerText = summary;
  
  var productPlaceholder = document.getElementById('class'+id);   
    hiddenElement.style.display = ''; // Show the hidden element
    productPlaceholder.appendChild(hiddenElement);
}

async function recommendTraining() {
		 document.getElementById('askSpinner').style.display = 'block';
		var clientAnswer = document.getElementById("questionInput").value;
		
		updateConversation(clientAnswer,"");
		clearChat();
		//await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");
		
		const response = await fetch(`/recommendTraining?clientAnswer=${encodeURIComponent(clientAnswer)}&trainType=${encodeURIComponent(chosenType)}`, {
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
			appendTrainingToPage(x+1,items[x]['Name'],items[x]['Summary']);
		}
		
		  document.getElementById('askSpinner').style.display = 'None';
		updateConversation("", "根据您的回答，已为您推荐最合适的培训课程");
		//await talkCustom("以下是推荐的产品，请点击产品了解更多信息，同时也可以随时提出您自己的问题。");
		
		enableAskQuestions();
	
}





// On page load, fetch the data and populate the table
window.addEventListener('load', () => {
	//updateConversation("","我是您的智能保险助手。我可以如何协助您");

});