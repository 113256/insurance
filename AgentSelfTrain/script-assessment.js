
let conversationHistory = [];
let chosenType = "";
let quizItems;
let currentQuestion;

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

function getCheckedCheckboxes() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var values = [];
  
  checkboxes.forEach(function(checkbox) {
    values.push(checkbox.nextSibling.nodeValue.trim()); // Get the label text next to the checked checkbox
  });
  
  return values.join(",");
}

function appendClassChoiceToConversation() {
  var hiddenElement = document.getElementById('trainingChoice').cloneNode(true);
  var conversationElement = document.getElementById('conversation');

  if (hiddenElement && conversationElement) {
    hiddenElement.style.display = ''; // Show the hidden element
    conversationElement.appendChild(hiddenElement);
  }
}

function appendClassChoiceToConversationChinese() {
  var hiddenElement = document.getElementById('trainingChoiceChinese').cloneNode(true);
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
function nextQuestion(){
  showQuiz(currentQuestion+1);
}
function showQuiz(questionNumber){
  currentQuestion = questionNumber;
     
    document.getElementById("question").innerText = currentQuestion.toString() +". "+quizItems[questionNumber-1].Question;  
    document.querySelector('label[for="option1"]').innerText = quizItems[questionNumber-1].Option1;
  document.querySelector('label[for="option2"]').innerText= quizItems[questionNumber-1].Option2;
    document.querySelector('label[for="option3"]').innerText = quizItems[questionNumber-1].Option3;
     document.querySelector('label[for="option4"]').innerText = quizItems[questionNumber-1].Option4;

     if (questionNumber==10){
      document.getElementById('submit').style.display = '';
            document.getElementById('next').style.display = 'None';
     }
}

function submitAnswers(){
    document.getElementById('quiz').style.display = 'None';
  document.getElementById('finish').style.display = '';
}

async function generateQuiz(){
       document.getElementById('quizSpinner').style.display = 'block';
  var skills = getCheckedCheckboxes();
  //var topics =req.query.topics;
  //var language = req.query.language;
  var language   = document.getElementById("currentLanguage").innerText ;
  if (skills != ""){
    const response = await fetch(`/generateQuiz?topics=${encodeURIComponent(skills)}&language=${encodeURIComponent(language)}`, {
      method: 'POST',
    });


    var responseTxt = await response.text();
    console.log(responseTxt);
     quizItems = eval(responseTxt); //use eval instead of json.parse for [ ] json data (can use parse for { } )
     /*
    for (var x = 0; x < items.length; x++) {
      console.log(items[x].Name);
      //function appendProductToPage(id, name, summary, cost, guarantee,details,reason) {
      appendTrainingToPage(x+1,items[x]['Name'],items[x]['Summary']);
    }
    */
    showQuiz(1);
         document.getElementById('quizSpinner').style.display = 'None';
    document.getElementById('quiz').style.display = '';
  }
}


function appendTrainingToPage(id, title, summary) {

	const conversationElement = document.getElementById('class'+id);
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }

  var hiddenElement =  document.getElementsByName('class')[0].cloneNode(true);
    hiddenElement.getElementsByClassName("name")[0].innerText = title;
  hiddenElement.getElementsByClassName("summary")[0].innerText = summary;
  
  var productPlaceholder = document.getElementById('class'+id);   
    hiddenElement.style.display = ''; // Show the hidden element
    productPlaceholder.appendChild(hiddenElement);
}

function appendTrainingToPageChinese(id, title, summary) {

	const conversationElement = document.getElementById('class'+id);
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }

  var hiddenElement =  document.getElementsByName('classChi')[0].cloneNode(true);
    hiddenElement.getElementsByClassName("name")[0].innerText = title;
  hiddenElement.getElementsByClassName("summary")[0].innerText = summary;
  
  var productPlaceholder = document.getElementById('class'+id);   
    hiddenElement.style.display = ''; // Show the hidden element
    productPlaceholder.appendChild(hiddenElement);
}

async function recommendTraining() {
		var language   = document.getElementById("currentLanguage").innerText ;

		 document.getElementById('askSpinner').style.display = 'block';
		var clientAnswer = document.getElementById("questionInput").value;
		
		updateConversation(clientAnswer,"");
		clearChat();
		//await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");
		
		const response = await fetch(`/recommendTraining?clientAnswer=${encodeURIComponent(clientAnswer)}&trainType=${encodeURIComponent(chosenType)}&language=${encodeURIComponent(language)}`, {
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

	if (language=="Chinese"){
		updateConversation("", "根据您的回答，已为您推荐最合适的培训课程");
	} else {
		updateConversation("", "Based on your response, the most suitable training courses have been recommended for you.");
	}

		
		//await talkCustom("以下是推荐的产品，请点击产品了解更多信息，同时也可以随时提出您自己的问题。");
		
		enableAskQuestions();
	
}

function askExperience(type){
	chosenType = type;

var language   = document.getElementById("currentLanguage").innerText ;
	if (language=="Chinese"){
		updateConversation("", "你选择了" + type + "，请告诉我更多关于你的经验以及你想学习的" + type + "的类型。");
	} else {
		updateConversation("", "You have chosen "+type+", tell me more about your experience and the kind of "+type+" you want to learn");
	}

	enableChat();
}



function openPopup(event, url) {
  event.preventDefault();
  const width = 800;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  const features = `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`;
  //target="_blank" means it will open a new window 
  window.open(url, '_blank', features);
}




function reset(){
	disableChat();
	clearChatHistory();
	var language   = document.getElementById("currentLanguage").innerText ;
	if (language=="Chinese"){
		updateConversation("","你好，我是你的训练助手，请在下面选择学习主题。");
		appendClassChoiceToConversationChinese();
	} else {
		updateConversation("","Hello, I'm your training assistant, please select the learning topic below");
		appendClassChoiceToConversation();
	}


  var conversationElement = document.getElementById('class1');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
 conversationElement = document.getElementById('class2');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
	 conversationElement = document.getElementById('class3');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
	 conversationElement = document.getElementById('class4');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
}

function clearChatHistory(){
  const conversationElement = document.getElementById('conversation');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
}
// On page load, fetch the data and populate the table
window.addEventListener('load', () => {
	//reset();

});