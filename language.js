function eng(){
	document.getElementById("currentLanguage").innerText = "English";
	var elements = document.querySelectorAll('span[lang]');

    // Loop through each element and hide those with lang="cn"
    elements.forEach(function(element) {
      if (element.getAttribute('lang') === 'cn') {
          console.log(element);
        element.style.display = 'None';
      }
      if (element.getAttribute('lang') === 'en') {
          console.log(element);
        element.style.display = '';
      }
    });


    try{
    	document.getElementById("coverage").value = "Critical Illnesses and surgery fees within 100k";
    	document.getElementById("policy").value = "Critical Ilnesses";
    	document.getElementById	("questionInput").placeholder = "Ask any question about the claim";
    }catch(e){}	
}

function cn(){
		document.getElementById("currentLanguage").innerText = "Chinese";
	var elements = document.querySelectorAll('span[lang]');

    // Loop through each element and hide those with lang="cn"
    elements.forEach(function(element) {
      if (element.getAttribute('lang') === 'en') {
          console.log(element);
        element.style.display = 'None';
      }
      if (element.getAttribute('lang') === 'cn') {
          console.log(element);
        element.style.display = '';
      }
    });

    try{
    	document.getElementById("coverage").value = "在10万美元以内的所有重大疾病和手术费用";
    	document.getElementById("policy").value = "重大疾病";
    	document.getElementById	("questionInput").placeholder = "问任何与索赔或保单相关的问题";
    }catch(e){}

}

eng();