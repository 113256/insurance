let conversationHistory = [];

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
  promptElement.style.color = '#000'; // Optional: set prompt text color
  responseElement.style.color = '#000'; // Optional: set response text color
  
  
// Style for prompt element
promptElement.style.background = '#e0b9e0'; // Set the background to grey
promptElement.style.border = '2px solid purple';
promptElement.style.padding = '10px';
promptElement.style.float = 'right'; // Align the entire box to the left

// Style for response element
responseElement.style.background = '#eeeeee'; // Set the background to grey
responseElement.style.border = '2px solid grey';
responseElement.style.padding = '10px';
responseElement.style.float = 'left'; // Align the entire box to the left

  conversationElement.appendChild(promptElement);
  conversationElement.appendChild(responseElement);
  conversationElement.scrollTop = conversationElement.scrollHeight;
} 

function getValuesFromFirstColumn() {
	var table = document.getElementById('questionTable');
	var rows = table.getElementsByTagName('tr');
	var values = [];

	for (var i = 1; i < rows.length; i++) {
		var cell = rows[i].getElementsByTagName('td')[0]; // Get the first cell (column) in the row
		var value = cell.textContent.trim();
		if (value == "Ask a question"){
			console.log("Skip");
		} else { 
			values.push(value);
		}
	}

	var joinedValues = values.join('##');
	console.log(joinedValues);
	return joinedValues;
}

//ask 1. how much is the stolen object worth?
//ask 2. what does the insurance policy cover?
async function processSingleQuestion(){
	console.log("Process Question");
	questionInput = document.getElementById("questionInput").value;
	try {
		
	  const formData = new FormData();
    var language  = document.getElementById("currentLanguage").innerText;
    formData.append('language', document.getElementById("currentLanguage").innerText);
	  //formData.append('questionListString', questionsList);
	  //formData.append('pdfText', pdfText);	
	  formData.append('question', questionInput);
		//formData.append('fileName', fileName); //need encodeURIComponent to make sure chinese filename isnt garbled
		console.log(formData);
	document.getElementById('askSpinner').style.display = 'block';
	const response = await fetch(`/processSingleQuestionLangchain?question=${encodeURIComponent(questionInput)}&language=${encodeURIComponent(language)}`, {
	  method: 'POST',
	  body: formData
	});
	console.log(response);
	if (response.ok) {
	  console.log("OK");
	  //const data = await response.json(); // Parse the JSON response
	  const data = await response.text(); // Parse the JSON response
		document.getElementById('askSpinner').style.display = 'none';
		console.log(data);
		//if (data.answer) {
			console.log("GG");
				updateConversation(questionInput, data);
				//document.getElementById("conversation").value = data;
				//const value = dictionary[key];
				//console.log(`Key: ${key}, Value: ${value}`);
			  
			
		//}
	}
	  /*
	  fetch(`/processSingleQuestionLangchain?question=${encodeURIComponent(questionInput)}`)
	.then(response => response.text())
	.then(text => {
		document.getElementById("chatResult").value = text;
			
	})
	.catch(error => console.error('Error fetching file content:', error));	
	  */
	
  } catch (error) {
	console.error('Error:', error);
	console.log('Error uploading PDFs.');
   }	
}

async function processQuestions(){
	console.log("Process Questions");
	const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
	let questionList;
	 const fileName = urlParams.get('fileName');
	// Fetch and display the content of uploads/fileName.txt in the sourceText textarea
	let pdfText = "";
	fetch(`/read-file?fileName=${encodeURIComponent(fileName.replace(".pdf",".txt"))}`)
		.then(response => response.text())
		.then(text => {
			pdfText = text;
			
				
		})
		.catch(error => console.error('Error fetching file content:', error));	
	questionListString = getValuesFromFirstColumn();
	try {
		
	  const formData = new FormData();
	  //formData.append('questionListString', questionsList);
	  //formData.append('pdfText', pdfText);	
	  formData.append('test', "test");
		//formData.append('fileName', fileName); //need encodeURIComponent to make sure chinese filename isnt garbled
	const response = await fetch(`/processQuestionList?fileName=${fileName}&questionListString=${encodeURIComponent(questionListString)}`, {
	  method: 'POST',
	  body: formData
	});

	if (response.ok) {
	  alert('Questions successfully processed!');
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

async function generateEmail() {

  document.getElementById('emailSpinner').style.display = 'block';
  try {

      const formData = new FormData();
      var language   = document.getElementById("currentLanguage").innerText ;
       formData.append('language', document.getElementById("currentLanguage").innerText );

    const response = await fetch(`/generateEmail?language=${encodeURIComponent(language)}`, {
      method: 'POST',
      body: formData,
    });
    //const response = await fetch('/generateEmail');



    if (response.ok) {
		console.log("res opk");
		const data = await response.text(); // Parse the JSON response
		console.log("DATA " + data);
		document.getElementById('emailSpinner').style.display = 'none';
		console.log(data.email);
		document.getElementById("email").value = data;
		

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

async function uploadPolicyDoc() {
	console.log("SSS");
  const fileInput = document.getElementById('pdfs');
  const files = fileInput.files;
  
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    formData.append('pdfs[]', file, encodeURIComponent(file.name));
  }
  document.getElementById('formSpinner').style.display = 'block';
  try {
    const response = await fetch('/loadPolicyDoc', {
      method: 'POST',
      body: formData,
    });



    if (response.ok) {
		console.log("res opk");
    } else {
      alert('Error uploading PDFs.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error uploading PDFs.');
  }
}

async function uploadPDF() {
	console.log("SSS");
  const fileInput = document.getElementById('pdfs');
  const files = fileInput.files;
  
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    formData.append('pdfs[]', file, encodeURIComponent(file.name));
  }
	formData.append('coverage', document.getElementById("coverage").value);
    formData.append('policy', "Critical Illness");
    formData.append('language', document.getElementById("currentLanguage").innerText);
  document.getElementById('formSpinner').style.display = 'block';
  try {
    const response = await fetch('/upload', {
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
      document.getElementById("TypeOfDocument").value = "重大疾病"
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


async function fetchDataAndPopulateTable() {
  try {
    const response = await fetch('/fetch-data');
    const data = await response.json();

    const qaTable = document.getElementById('qaTable');
    const uploadInfoTable = document.getElementById('uploadInfo');

    // Clear existing table rows while keeping the headers intact
    const qaTableBody = qaTable.querySelector('tbody');
    qaTableBody.innerHTML = '';

    const uploadInfoTableBody = uploadInfoTable.querySelector('tbody');
    uploadInfoTableBody.innerHTML = '';
    console.log(data.qaData);
    // Populate the qa table with the retrieved data
    data.qaData.forEach((row) => {
      const newRow = qaTableBody.insertRow();
      const fileNameCell = newRow.insertCell();
      const questionCell = newRow.insertCell();
		 const answerCell = newRow.insertCell();
		 const deleteCell = newRow.insertCell(); // New cell for the "Delete" button
      fileNameCell.innerHTML = `<a href="display_ae_table.html?fileName=${encodeURIComponent(row.fileName)}" onclick="openPopup(event, this.href); return false;" >${row.fileName}</a>`;//target="_blank" means it will open a new window
	  console.log("Q : "+row.question+", A=  "+row.answer);
	  
      questionCell.textContent = row.question;
	  answerCell.textContent = row.answer;
	      // Create the "Delete" button and add a click event listener
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.classList.add('btn', 'btn-outline-danger');
		deleteButton.addEventListener('click', () => {
		  deleteUploadInfo(row.fileName);
		});
		deleteCell.appendChild(deleteButton);
    });

    // Populate the uploadInfo table with the retrieved data
    data.uploadInfoData.forEach((row) => {
      const newRow = uploadInfoTableBody.insertRow();
      const fileNameCell = newRow.insertCell();
      const timeCell = newRow.insertCell();
		 const deleteCell = newRow.insertCell(); // New cell for the "Delete" button
      fileNameCell.innerHTML = `<a href="display_ae_table.html?fileName=${encodeURIComponent(row.fileName)}" onclick="openPopup(event, this.href); return false;" >${row.fileName}</a>`;//target="_blank" means it will open a new window
	  
	  const askQuestionCell = newRow.insertCell();
	  
      timeCell.textContent = row.uploadTime;
	      // Create the "Delete" button and add a click event listener
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.classList.add('btn', 'btn-outline-danger');
		deleteButton.addEventListener('click', () => {
		  deleteUploadInfo(row.fileName);
		});
		deleteCell.appendChild(deleteButton);
		
		const askQuestionButton = document.createElement('button');
		askQuestionButton.textContent = 'Ask Questions';
		askQuestionButton.classList.add('btn', 'btn-outline-danger');
		askQuestionButton.addEventListener('click', () => {
		  openPopup(event, `askQuestion.html?fileName=${encodeURIComponent(row.fileName)}`);
		});
		askQuestionCell.appendChild(askQuestionButton);
    });
	
	
	// Set the options of the "medicineDropdown" dropdown to match unique Medicine values
    const uniqueFileNames = [...new Set(data.qaData.map((row) => row.FileName))]; // Get unique Medicine values
    const fileDropdown = document.getElementById('fileDropdown');
    fileDropdown.innerHTML = ''; // Clear existing options
	
	  const option = document.createElement('option');
      option.value = '';
	  //option.className = "dropdown-item";
      option.textContent = "All Files";
      fileDropdown.appendChild(option);
	  
    // Add options for each unique Medicine value
    uniqueFileNames.forEach((file) => {
      const option = document.createElement('option');
	  //option.className = "dropdown-item";
      option.value = file;
      option.textContent = file;
      fileDropdown.appendChild(option);
    });
	
	
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Error fetching data.');
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


async function deleteUploadInfo(fileName) {
  try {
    const response = await fetch(`/delete-upload-info?fileName=${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // If deletion is successful, fetch the data again to update the table
      await fetchDataAndPopulateTable();
      alert('File deleted successfully.');
    } else {
      alert('Error deleting file.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting file.');
  }
}

function filterTable() {
  const selectedMedicine = document.getElementById('medicineDropdown').value;
  const selectedEffect = document.getElementById('effectFilter').value;
  const dataTable = document.getElementById('aeTable');
  const tableRows = dataTable.querySelectorAll('tbody tr');

  // Loop through each row in the table and check if it matches the selected filters
  tableRows.forEach((row) => {
	  const fileNameCell = row.querySelector('td:first-child').innerText;
    const medicineCell = row.querySelector('td:nth-child(2)').innerText;
    const effectsCell = row.querySelector('td:nth-child(3)').innerText;
	
    // Show the row if both filters match or if any of the filters is set to "All"
    if (
      (selectedMedicine === '' || medicineCell === selectedMedicine) &&
      (selectedEffect === '' || effectsCell.includes(selectedEffect))
    ) {
      row.style.display = 'table-row';
    } else {
      row.style.display = 'none';
    }
  });
}

function downloadAETable() {
  const aeTable = document.getElementById('qaTable');
  const aeTableBody = aeTable.querySelector('tbody');
  const tableRows = aeTableBody.querySelectorAll('tr');

  const data = [['File Name', 'Question', 'Answer']];

  // Loop through each row in the table and collect data
  tableRows.forEach((row) => {
    const fileNameCell = row.querySelector('td:first-child').textContent;
    const questionCell = row.querySelector('td:nth-child(2)').textContent;
    const answerCell = row.querySelector('td:nth-child(3)').textContent;

    data.push([fileNameCell, questionCell, answerCell]);
  });

  // Create a CSV format from the data
  //addition of \uFEFF at the beginning of the csvContent variable. This represents the BOM character and will signal Excel to correctly interpret the character encoding of the CSV file.
  const csvContent = '\uFEFF' + data.map((row) => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  // Create a Blob from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a hidden anchor element for downloading
  const a = document.createElement('a');
  a.href = url;
  a.download = 'QA_Table.csv';
  a.style.display = 'none';
  
  // Append the anchor element to the document and click it to trigger download
  document.body.appendChild(a);
  a.click();
  
  // Clean up by revoking the Blob URL
  window.URL.revokeObjectURL(url);
}





// On page load, fetch the data and populate the table
window.addEventListener('load', () => {
	if (window.location.pathname.endsWith("/")) {
        //fetchDataAndPopulateTable();
    }
});