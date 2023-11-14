
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
promptElement.style.maxWidth = '90%'; // Set the maximum width
promptElement.style.wordBreak = 'normal'; // Break long words

responseElement.style.width = '90%'; // Set the  width
//responseElement.style.wordWrap = 'break-word'; // Break long words onto the next line
responseElement.style.maxWidth = '90%'; // Set the maximum width
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







// On page load, fetch the data and populate the table
window.addEventListener('load', () => {
	//updateConversation("","我是您的智能保险助手。我可以如何协助您");

});