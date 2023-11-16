
let conversationHistory = [];
let chosenType = "";
let quizItems;
let currentQuestion;

 

function getCheckedCheckboxes() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var values = [];
  
  checkboxes.forEach(function(checkbox) {
    values.push(checkbox.nextSibling.innerText.trim()); // Get the label text next to the checked checkbox
  });
  
  return values.join(",");
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




// On page load, fetch the data and populate the table
window.addEventListener('load', () => {
	//reset();

});