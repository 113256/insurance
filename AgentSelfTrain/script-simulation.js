
let conversationHistory = [];
let chosenType = "";

let customTarget;
let customScenario;


async function processCustomTarget(){
    customTarget = document.getElementById("questionInput").value;
    //updateConversation("","请根据以上目标客户提供一个特定的情境");
    document.getElementById('send').removeEventListener('click', processCustomTarget);
    //document.getElementById('send').addEventListener('click', processCustomScenario);
    startSimulation(customTarget);
}

async function processCustomScenario(){
    customScenario = document.getElementById("questionInput").value;

    console.log(customTarget);
    console.log(customScenario);
    clearChatHistory();
   document.getElementById('askSpinner').style.display = 'block';
    
    clearChat();
    //await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");
    
    const response = await fetch(`/generateCustomSimulation?target=${encodeURIComponent(customTarget)}&scenario=${encodeURIComponent(customScenario)}`, {
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
      updateConversation(items[x]['Client'],items[x]['Agent']);
    }
    
      document.getElementById('askSpinner').style.display = 'None';
}

function askCustomTarget(){
  clearChatHistory();

   var language   = document.getElementById("currentLanguage").innerText ;
  var greeting;
  if (language=="Chinese"){
    updateConversation("", "请提供一个特定的目标客户，例如学生、老年人、家庭等")
  } else {
      updateConversation("", "Please provide a specific client type, for example student, elder or family etc.")
  }

  
document.getElementById('send').addEventListener('click', processCustomTarget);

}

function clearChatHistory(){
  const conversationElement = document.getElementById('conversation');
  // Clear all child elements
  while (conversationElement.firstChild) {

    conversationElement.removeChild(conversationElement.firstChild);
  }
}

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
  responseElement.style.textAlign = 'left';
  promptElement.style.marginLeft = '150px'; // Optional: add some spacing between prompt and response
  promptElement.style.fontWeight = 'bold'; // Optional: make prompt text bold
  promptElement.style.fontSize = '11px';
  responseElement.style.fontSize = '11px';
  promptElement.style.color = '#000'; // Optional: set prompt text color
  responseElement.style.color = '#000'; // Optional: set response text color
  
//promptElement.style.width = '300px'; // Set the  width
//promptElement.style.wordWrap = 'break-word'; // Break long words onto the next line
promptElement.style.maxWidth = '500px'; // Set the maximum width
promptElement.style.wordBreak = 'normal'; // Break long words

responseElement.style.width = '500px'; // Set the  width
//responseElement.style.wordWrap = 'break-word'; // Break long words onto the next line
responseElement.style.maxWidth = '500px'; // Set the maximum width
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
  responseElement.style.width = '500px'; // Set the  width
  responseElement.style.maxWidth = '500px';
  responseElement.style.float = ''; // if no prompt, put response in the center
  
}

if (response != "")
{ 

conversationElement.appendChild(responseElement);

} else {
  
}


  
  conversationElement.scrollTop = conversationElement.scrollHeight;
} 



async function startSimulation(target){
  document.getElementById('send').addEventListener('click', generateSimulation);
  customTarget = target;
      var language   = document.getElementById("currentLanguage").innerText ;
  var greeting;
  if (language=="Chinese"){
    greeting = "你好，我是您专属的保险专员。有什么可以帮到您的吗？";
  } else {
      greeting = "Hello, I am your dedicated insurance officer. How may I help you?";
  }
  clearChatHistory();
    updateConversation("", greeting);
    const response = await fetch(`/startSimulation?greeting=${encodeURIComponent(greeting)}`,{
     method: 'POST',
    });

   

    
}


async function generateSimulation(){
	console.log(customTarget);
   document.getElementById('askSpinner').style.display = 'block';
    var clientAnswer = document.getElementById("questionInput").value;
    
    updateConversation(clientAnswer,"");
    clearChat();
    //await talkCustom("Medical insurance is primarily used for the reimbursement of medical expenses. Key points to consider before choose a product are:\n1. Priority allocation of hospitalization medical insurance.\n2. If you cannot afford millions in medical coverage, you can opt for anti-cancer medical insurance.\n3. Depending on your specific situation, consider supplementing with other medical insurance.\nPlease refer below for the recommended products, click the Images for more details.");
    
    const response = await fetch(`/generateSimulation?target=${encodeURIComponent(customTarget)}&clientAnswer=${encodeURIComponent(clientAnswer)}`, {
      method: 'POST',
    });

    console.log(response);
    var responseTxt = await response.text();
          console.log(responseTxt);
    //responseTxt = responseTxt.match(/\{[\s\S]*?\}/)[0];
     
     /*
     
     var items = eval(responseTxt); //use eval instead of json.parse for [ ] json data (can use parse for { } )
    for (var x = 0; x < items.length; x++) {
      console.log(items[x].Name);
      //function appendProductToPage(id, name, summary, cost, guarantee,details,reason) {
      updateConversation(items[x]['Client'],items[x]['Agent']);
    }
    */
    updateConversation("",responseTxt);

      document.getElementById('askSpinner').style.display = 'None';
    //updateConversation("", "根据您的回答，已为您推荐最合适的培训课程");
    //await talkCustom("以下是推荐的产品，请点击产品了解更多信息，同时也可以随时提出您自己的问题。");
    
}



function reset(){
  clearChatHistory();
  var language   = document.getElementById("currentLanguage").innerText ;
  if (language=="Chinese"){
    updateConversation("","请选择您的目标客户。您还可以点击“自定义”以指定您自己的客户和情境。");


  } else {
    updateConversation("","Please select your target client. You can also select 'Custom' to define your own client type");

  }
  
  
}

// On page load, fetch the data and populate the table
window.addEventListener('load', () => {
	reset();
});