
let conversationHistory = [];
let chosenType = "";
let quizItems;
let currentQuestion;
let candidateAnswers = "";
 

function getCheckedCheckboxes() {
    var language   = document.getElementById("currentLanguage").innerText ;
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var values = [];
  
  checkboxes.forEach(function(checkbox) {
    if (language == "Chinese"){
    values.push(checkbox.nextSibling.nextSibling.innerText.trim()); // Get the label text next to the checked checkbox
    } else {
          values.push(checkbox.nextSibling.innerText.trim()); // Get the label text next to the checked checkbox
    }

  });
  
  let insuranceElements = values.filter(element => element.toLowerCase().includes("construction") || element.toLowerCase().includes("insurance") || element.includes("保险"));
  let nonInsuranceElements = values.filter(element => !element.toLowerCase().includes("construction") || !element.toLowerCase().includes("insurance") && !element.includes("保险"));

  // Check if there are at least 3 elements with "insurance" and 3 elements without
  if (insuranceElements.length >= 3 && nonInsuranceElements.length >= 3) {
      console.log("The array meets the criteria.");
      return values.join(",");
  } else {
      console.log("The array does not meet the criteria.");
      //alert("Please select at least 3 Performance Skills and 3 Product Knowledge Skills");
      var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
      });
      myModal.show();
      return "";
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

function getSelectedRadioValue() {
            var radioButtons = document.getElementsByName('flexRadioDefault');
            var selectedValue;

            for (var i = 0; i < radioButtons.length; i++) {
                if (radioButtons[i].checked) {
                    selectedValue = radioButtons[i].id;
                    break;
                }
            }

            console.log(selectedValue);
            return selectedValue;
        }

function storeCurrentAnswer(){
  candidateAnswers = candidateAnswers + ".Question "+currentQuestion+": "+getSelectedRadioValue();
}


function nextQuestion(){
  storeCurrentAnswer();
  showQuiz(currentQuestion+1);
}
function showQuiz(questionNumber){
  currentQuestion = questionNumber;
         document.getElementById("question").innerText = quizItems[questionNumber-1].Question;  
    //document.getElementById("question").innerText = currentQuestion.toString() +". "+quizItems[questionNumber-1].Question;  
    document.querySelector('label[for="option1"]').innerText = quizItems[questionNumber-1].Option1;
  document.querySelector('label[for="option2"]').innerText= quizItems[questionNumber-1].Option2;
    document.querySelector('label[for="option3"]').innerText = quizItems[questionNumber-1].Option3;
     document.querySelector('label[for="option4"]').innerText = quizItems[questionNumber-1].Option4;

     if (questionNumber==10){
          document.getElementById('next').style.display = 'None';
      document.getElementById('submit').style.display = '';
      //document.getElementById('next').style.display = 'None';
     }
}

async function performanceAnalysis(){
         document.getElementById('quizSpinner').style.display = 'block';
                document.getElementById('finish').style.display = 'None';
                 document.getElementById('charts').style.display = 'block';

       const formData = new FormData();
    var skills = getCheckedCheckboxes();
  console.log(candidateAnswers);
formData.append('candidateAnswers', candidateAnswers);
  var skills = getCheckedCheckboxes();
  //var topics =req.query.topics;
  //var language = req.query.language;
  var language   = document.getElementById("currentLanguage").innerText ;
  const response = await fetch(`/performanceAnalysis?skills=${encodeURIComponent(skills)}`, {
      method: 'POST',
      body: formData
    });


    var responseTxt = await response.text();
    var responseJSON = JSON.parse(responseTxt);
    console.log(responseJSON)

    // Given JSON data
    //var skillsData = {"Product Knowledge": 5, "Problem Solving Abilities": 2, "Ethical Conduct": 4};

    var skillsData = {};
    var skillsData2 = {};


        // Populate rows array with data from skillsData
    Object.keys(responseJSON).forEach(skill => {
      if (skill.toLowerCase().includes('construction') || skill.toLowerCase().includes('insurance') || skill.toLowerCase().includes('保险')) {
        skillsData2[skill] = responseJSON[skill];
      } else {
        skillsData[skill] = responseJSON[skill];
      }
    });


    // Convert JSON data to chart data format
    var chartData = {
      header: ['Skills', 'Rating'],
      rows: []
    };
    // Populate rows array with data from skillsData
    Object.keys(skillsData).forEach(skill => {
      chartData.rows.push([skill, skillsData[skill]]);
    });
    console.log(chartData);
     // create a radar chart
      var chart = anychart.radar();
      // set the chart data
      chart.data(chartData);
      chart.yScale().minimum(0);
      chart.yScale().maximum(5);
      // set the chart title
      chart.title("Overall Performance Analysis");
      // set the container id
      chart.container('chart1');
      // display the radar chart
      chart.draw();





    // Convert JSON data to chart data format
    chartData = {
      header: ['Skills', 'Rating'],
      rows: []
    };
    // Populate rows array with data from skillsData
    Object.keys(skillsData2).forEach(skill => {
      chartData.rows.push([skill, skillsData2[skill]]);
    });
    console.log(chartData);
     // create a radar chart
      chart = anychart.radar();
      // set the chart data
      chart.data(chartData);
      // set the chart title
      chart.title("Product Knowledge");
      chart.yScale().minimum(0);
      chart.yScale().maximum(5);
      // set the container id
      chart.container('chart2');
      // display the radar chart
      chart.draw();



      document.getElementById('quizSpinner').style.display = 'None';


}

function reset(){
        document.getElementById('quiz').style.display = 'None';
                document.getElementById('finish').style.display = 'None';
                        document.getElementById('charts').style.display = 'None';
                          var ele = document.getElementById('chart1');
  // Clear all child elements
  while (ele.firstChild) {

    ele.removeChild(ele.firstChild);
  }

                             ele = document.getElementById('chart2');
  // Clear all child elements
  while (ele.firstChild) {

    ele.removeChild(ele.firstChild);
  }
}


function submitAnswers(){
    storeCurrentAnswer();
    document.getElementById('next').style.display = 'None';
    document.getElementById('quiz').style.display = 'None';
  document.getElementById('finish').style.display = '';
    document.getElementById('submit').style.display = 'None';
}

async function generateQuiz(){

  var skills = getCheckedCheckboxes();

  if (skills == ""){

  } else {
           document.getElementById('quizSpinner').style.display = 'block';
               document.getElementById('next').style.display = 'block';
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
        document.getElementById('next').style.display = '';
    }
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