// app.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
//const fetch = require('node-fetch');
const PDFParser = require('pdf-parse');
const http = require('http');
//const  PDFExtract = require('pdf-extraction');
//const pdfjsLib = require('pdfjs-dist')
;const path = require('path');
const XLSX = require('xlsx');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const langchainFunctions = require('./langchainFunctions');

//const cors = require('cors');


/*import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import PDFParser from 'pdf-parse';
import sqlite3 from 'sqlite3';
import http from 'http';
*/
const app = express();
//app.use(cors());

const port = process.env.PORT || 3000
//const http = require('http');


// Set up multer for handling file uploads with custom storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    // Use the original file name provided by the client
    cb(null, decodeURIComponent(file.originalname));
  }
});

//const upload = multer({ storage: storage });
const upload = multer({ dest: 'uploads/' });



async function readFile(fileName){
  console.log("Reading "+fileName);	 
  fileName = decodeURIComponent(fileName);
 console.log("Reading "+fileName);	 
  const filePath = path.join(__dirname, 'uploads', fileName);
   console.log(path.join(__dirname, 'uploads', fileName));
 return fs.readFileSync(filePath, 'utf8')

}



app.get('/read-file', (req, res) => {
  const fileName = decodeURIComponent(req.query.fileName);

  // Check if the fileName is provided
  if (!fileName) {
    return res.status(400).send('File name not provided.');
  }

  const filePath = path.join(__dirname, 'uploads', fileName);
   console.log(path.join(__dirname, 'uploads', fileName));
  // Read the file content
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err.message);
      return res.status(500).send('Error reading file.');
    }

    // Send the file content as the response
	console.log(data);
    res.send(data);
  });
});


app.get('/fetch-data', (req, res) => {
  const fileName = req.query.fileName;
  console.log("FN = " + fileName);
  // Fetch data from the AE table
  let query = `SELECT * FROM QA`;

  if (fileName) {
    query += ` WHERE fileName = ?`;
  }

  db.all(query, [fileName], (err, qaRows) => {
    if (err) {
      console.error('Error fetching data from AE table:', err.message);
      return res.status(500).json([]);
    }

    // Fetch data from the uploadInfo table
    db.all('SELECT * FROM uploadInfo', [], (err, uploadInfoRows) => {
      if (err) {
        console.error('Error fetching data from uploadInfo table:', err.message);
        return res.status(500).json([]);
      }
	  console.log(qaRows.toString());
	  
	  const data = {
		qaData: qaRows,
		uploadInfoData: uploadInfoRows,
	  };
	  
	  return res.json(data);
	  
    });
  });
});


// DELETE route to delete rows from the uploadInfo and AE tables
app.delete('/delete-upload-info', async (req, res) => {
  const fileName = req.query.fileName;
  console.log(fileName);
  console.log(decodeURIComponent(fileName));
  try {
    // Delete rows from the uploadInfo table where fileName matches
    db.run('DELETE FROM uploadInfo WHERE fileName = ?', [fileName], (err) => {
      if (err) {
        console.error('Error deleting from uploadInfo table:', err.message);
        return res.status(500).send('Internal Server Error');
      }

      console.log(`Rows with fileName '${fileName}' deleted from uploadInfo table.`);

      // Now, delete rows from the AE table where fileName matches
      db.run('DELETE FROM QA WHERE fileName = ?', [fileName], (err) => {
        if (err) {
          console.error('Error deleting from QA table:', err.message);
          return res.status(500).send('Internal Server Error');
        }

        console.log(`Rows with fileName '${fileName}' deleted from AE table.`);
        return res.status(200).send('Data deleted successfully.');
      });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

/*
function getPDFText(pdfUrl){
  var pdf = pdfjsLib.getDocument(pdfUrl);
  return pdf.promise.then(function(pdf) { // get all pages text
    var maxPages = pdf.numPages;
    var countPromises = []; // collecting all page promises
    for (var j = 1; j <= maxPages; j++) {
      var page = pdf.getPage(j);

      var txt = "";
      countPromises.push(page.then(function(page) { // add page promise
        var textContent = page.getTextContent();
        return textContent.then(function(text){ // return content promise
          return text.items.map(function (s) { return s.str; }).join(''); // value page text 
        });
      }));
    }
    // Wait for all pages and join text
    return Promise.all(countPromises).then(function (texts) {
      return texts.join('');
    });
  });
}
*/
async function getPDFText(pdfUrl){
  const pdfBuffer = fs.readFileSync(pdfUrl); 
  const data = await PDFParser(pdfBuffer);
  console.log(data);
  return data.text;
}
//

app.post('/processSingleQuestionLangchain', async (req, res) => {
	console.log("A");
	//console.log("PDFPTEXT " +pdfText);
	try {
	var claimDetails = fs.readFileSync(path.join(__dirname, 'uploads', "extractedFields.txt"), 'utf8');
  /*
	var question = "You are an professional insurance officer. Answer the following question in a professional and thorough manner based on the context provided: "+req.query.question + ". Your response MUST be in Chinese Simplified. Also take into account the details of the current claim: "+claimDetails ;
	console.log("QL + "+question);
	var answerTxt = await langchainFunctions.langchainProcessOneQuestion("policy.txt", question);
  */
var question = "You are an professional insurance officer. Answer the following question in a professional and thorough manner: "+req.query.question + ". {chineseModifier} Answer is based on details of the current claim: "+claimDetails ;

  if (req.query.language == "Chinese"){
    question = question.replace("{chineseModifier}", "Your response MUST be in Chinese Simplified. ");
  } else {
    question = question.replace("{chineseModifier}", "");
  }

  console.log("QL + "+question);
  var answerTxt = await processPromptDataCustomToken(question, false, 1000);

	//update chat window
	console.log(answerTxt);
	/*
	const responseData = {
      answer: answerTxt
    };
	*/
	    // Send the dictionary as JSON response
    //return res.status(200).json(responseData); //DONT USE RES.status(200) as it refreshes the page , use res.send(answer) instead! 
	res.send(answerTxt);
	
	//return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

app.post('/processQuestionList', async (req, res) => {
	console.log("A");
	console.log("BODY DDD " +req.query);
	console.log("BODY DDD " +req.query.fileName);
	var pdfText = readFile((req.query.fileName).replace(".pdf",".txt"));
	//console.log("PDFPTEXT " +pdfText);
	try {
	var questionListString = req.query.questionListString
	console.log("QL + "+questionListString);
	var questionList = decodeURIComponent(questionListString).split('##');
	var answersListString = await langchainFunctions.langchainProcessQuestions((req.query.fileName).replace(".pdf",".txt"), questionListString);
	var answersList = answersListString.split('##');
	// Loop through the array
	for (var i = 0; i < questionList.length; i++) {
		var question = questionList[i].trim();
		console.log("Question " + (i + 1) + ": " + question);
		await writeQuestionAndAnswerToDB(question, answersList[i],  req.query.fileName);
		//await processSingleQuestion(pdfText, question, req.query.fileName);
		
	}    
		
		return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

app.post('/processQuestionList', async (req, res) => {
	console.log("A");
	console.log("BODY DDD " +req.query);
	console.log("BODY DDD " +req.query.fileName);
	var pdfText = readFile((req.query.fileName).replace(".pdf",".txt"));
	//console.log("PDFPTEXT " +pdfText);
	try {
	var questionListString = req.query.questionListString
	console.log("QL + "+questionListString);
	var questionList = decodeURIComponent(questionListString).split('##');
	var answersListString = await langchainFunctions.langchainProcessQuestions((req.query.fileName).replace(".pdf",".txt"), questionListString);
	var answersList = answersListString.split('##');
	// Loop through the array
	for (var i = 0; i < questionList.length; i++) {
		var question = questionList[i].trim();
		console.log("Question " + (i + 1) + ": " + question);
		await writeQuestionAndAnswerToDB(question, answersList[i],  req.query.fileName);
		//await processSingleQuestion(pdfText, question, req.query.fileName);
		
	}    
		
		return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

async function writeQuestionAndAnswerToDB(question,answer,fileName) {
  console.log("Process prompt Data " +fileName);	

  await new Promise((resolve, reject) => {
	db.run('INSERT INTO QA (question, answer, fileName) VALUES (?, ?, ?)', [question, answer, fileName], (err) => {
	  if (err) {
		console.error('Database insertion error:', err.message);
		reject(err);
	  } else {
		console.log('Data inserted into QA table:');
		resolve();
	  }
	});
  });

// All data rows are inserted successfully
return Promise.resolve();
}








async function processSingleQuestion(pdfText, question,fileName) {
	
console.log("A");
	console.log("BODY DDD " +req.query);
	console.log("BODY DDD " +req.query.fileName);
	var pdfText = readFile((req.query.fileName).replace(".pdf",".txt"));
	//console.log("PDFPTEXT " +pdfText);
	try {
	var questionListString = req.query.questionListString
	console.log("QL + "+questionListString);
	var questionList = decodeURIComponent(questionListString).split('##');
	var answersListString = await langchainFunctions.langchainProcessQuestions((req.query.fileName).replace(".pdf",".txt"), questionListString);
	var answersList = answersListString.split('##');
	// Loop through the array
	for (var i = 0; i < questionList.length; i++) {
		var question = questionList[i].trim();
		console.log("Question " + (i + 1) + ": " + question);
		await writeQuestionAndAnswerToDB(question, answersList[i],  req.query.fileName);
		//await processSingleQuestion(pdfText, question, req.query.fileName);
		
	}    
		
		return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
}


function getFileNameFromPath(filePath) {
  return path.basename(filePath, path.extname(filePath));
}
function extractJSONString(response) {
  const regex = /\{[\s\S]*\}/; // Updated regex pattern to capture everything from the first '{' to the last '}'
  const match = response.match(regex);

  if (match) {
    return match[0];
  } else {
    throw new Error('JSON object not found in the response.');
  }
}


async function processPromptDataCustomTokenGPT4(prompt, jsonFormat, max_tokens) {
   fs.writeFileSync('prompt.txt', prompt);
  console.log("Process prompt Data " +prompt);  

 
  const maxRetries = 10; // You can adjust the number of retries as needed
  let retryCount = 0;
  let success = false;

while (!success && retryCount < maxRetries) {
  try {
    
  
  var data;

    const headers = {
      "Content-Type": "application/json",
      "api-key": "dc9c7f26d3b047a58ce8bfedd2db8eab"
    };
  if (jsonFormat){
       data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      response_format:{"type": "json_object"},
      temperature: 0,
      max_tokens: max_tokens
    });
    
  }else{
    data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      temperature: 0,
      max_tokens:max_tokens
  });
  }
  const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/GPT-4-8k/chat/completions?api-version=2023-07-01-preview", {
     method: "POST",
     headers: headers,
     body: data
    });
  //console.log(response);
  const responseTxt = await response.text(); // to print errors etc...
  console.log(responseTxt);
    //const responseData = await response.json();
        const responseData =  JSON.parse(responseTxt);
        console.log(responseData);
  //https://api.openai.com/v1/chat/completions
  
  
  
    console.log("RES:"+responseData.toString());

    var responseContent = responseData.choices[0].message.content;
  //https://api.openai.com/v1/chat/completions
  
  
  
    console.log("RES:"+responseData.toString());

    var responseContent = responseData.choices[0].message.content;
    //console.log("OLD = "+ responseContent);
  
  //responseContent = extractJSONString(responseContent);
  //console.log("NEW "+responseContent);

  
  // If the above operations succeed, mark the process as successful
    success = true;

    // All data rows are inserted successfully
    //return Promise.resolve();
  return responseContent;
  } catch (err) {
    console.error('Error processing prompt data:', err);
  await sleep(10000); // 5000 milliseconds = 5 seconds
      retryCount++;
    //throw err;
  }
}
  if (!success) {
    console.error('Failed after multiple retries. Aborting.');
    // Optionally, you can throw an error here or perform any other action.
    throw new Error('Failed after multiple retries. Aborting.');
    }
}


async function processPromptDataCustomToken(prompt, jsonFormat, max_tokens) {
   fs.writeFileSync('prompt.txt', prompt);
  console.log("Process prompt Data " +prompt);  

 
  const maxRetries = 10; // You can adjust the number of retries as needed
  let retryCount = 0;
  let success = false;

while (!success && retryCount < maxRetries) {
  try {
    

  
  
  /*

  */
//model: "gpt-4-1106-preview",
//gpt-3.5-turbo-1106
//NEW FEATURE IN GPT4 = JSON MODE
//---  add this to the request to make responses in JSON only  !!!  response_format={"type": "json_object"}
  
  
  var data;
  /*
      const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    };
  if (jsonFormat){
       data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      model: "gpt-3.5-turbo-1106",
      response_format:{"type": "json_object"},
      temperature: 0,
      max_tokens: max_tokens
    });
    
  }else{
        data = JSON.stringify({
        messages: [{"role": "user", "content": prompt}],
        model: "gpt-3.5-turbo-1106",
        temperature: 0,
        max_tokens: max_tokens
      });
    
  }
   const response = await fetch("https://api.openai.com/v1/chat/completions", {
     method: "POST",
     headers: headers,
     body: data
    });
  console.log(response);
    const responseData = await response.json();
  */

/*
       const headers = {
      "Content-Type": "application/json",
      "api-key": "dc9c7f26d3b047a58ce8bfedd2db8eab"
    };
  if (jsonFormat){
       data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      response_format:{"type": "json_object"},
      temperature: 0,
      max_tokens: max_tokens
    });
    
  }else{
    data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      temperature: 0,
      max_tokens:max_tokens
  });
  }


  const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/GPT-4-8k/chat/completions?api-version=2023-07-01-preview", {
     method: "POST",
     headers: headers,
     body: data
    });


  console.log(response);
    const responseData = await response.json();
 */ 
    const headers = {
      "Content-Type": "application/json",
      "api-key": "dc9c7f26d3b047a58ce8bfedd2db8eab"
    };
  if (jsonFormat){
       data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      response_format:{"type": "json_object"},
      temperature: 0,
      max_tokens: max_tokens
    });
    
  }else{
    data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      temperature: 0,
      max_tokens:max_tokens
  });
  }
 // const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/gpt-3-turbo/chat/completions?api-version=2023-07-01-preview", {
	   const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/gpt-35-turbo-16k/chat/completions?api-version=2023-07-01-preview", {
     method: "POST",
     headers: headers,
     body: data
    });
  //console.log(response);
  const responseTxt = await response.text(); // to print errors etc...
  console.log(responseTxt);
    //const responseData = await response.json();
        const responseData =  JSON.parse(responseTxt);
        console.log(responseData);
  //https://api.openai.com/v1/chat/completions
  
  
  
    console.log("RES:"+responseData.toString());

    var responseContent = responseData.choices[0].message.content;
  //https://api.openai.com/v1/chat/completions
  
  
  
    console.log("RES:"+responseData.toString());

    var responseContent = responseData.choices[0].message.content;
    //console.log("OLD = "+ responseContent);
  
  //responseContent = extractJSONString(responseContent);
  //console.log("NEW "+responseContent);

  
  // If the above operations succeed, mark the process as successful
    success = true;

    // All data rows are inserted successfully
    //return Promise.resolve();
  return responseContent;
  } catch (err) {
    console.error('Error processing prompt data:', err);
  await sleep(10000); // 5000 milliseconds = 5 seconds
      retryCount++;
    //throw err;
  }
}
  if (!success) {
    console.error('Failed after multiple retries. Aborting.');
    // Optionally, you can throw an error here or perform any other action.
    throw new Error('Failed after multiple retries. Aborting.');
    }
}

async function processPromptData(prompt, jsonFormat) {
  console.log("Process prompt Data " +prompt);	
  const scriptPath = "extractDetailsPrompt.txt";
 
  const maxRetries = 10; // You can adjust the number of retries as needed
  let retryCount = 0;
  let success = false;

while (!success && retryCount < maxRetries) {
  try {
    

	
	
	/*

	*/
//model: "gpt-4-1106-preview",
//gpt-3.5-turbo-1106
//NEW FEATURE IN GPT4 = JSON MODE
//---  add this to the request to make responses in JSON only  !!!  response_format={"type": "json_object"}
	
	
	var data;
	/*
	    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    };
	if (jsonFormat){
		   data = JSON.stringify({
		  messages: [{"role": "user", "content": prompt}],
		  model: "gpt-3.5-turbo-1106",
		  response_format:{"type": "json_object"},
		  temperature: 0,
		  max_tokens: 4000
    });
		
	}else{
		    data = JSON.stringify({
			  messages: [{"role": "user", "content": prompt}],
			  model: "gpt-3.5-turbo-1106",
			  temperature: 0,
			  max_tokens: 4000
			});
		
	}
	 const response = await fetch("https://api.openai.com/v1/chat/completions", {
     method: "POST",
     headers: headers,
     body: data
    });
	console.log(response);
    const responseData = await response.json();
    */
	/*
		   const headers = {
      "Content-Type": "application/json",
      "api-key": "dc9c7f26d3b047a58ce8bfedd2db8eab"
    };
	if (jsonFormat){
		   data = JSON.stringify({
		  messages: [{"role": "user", "content": prompt}],
		  response_format:{"type": "json_object"},
		  temperature: 0,
		  max_tokens: 4000
    });
		
	}else{
		data = JSON.stringify({
		  messages: [{"role": "user", "content": prompt}],
		  temperature: 0,
		  max_tokens:4000
	});
	}
	const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/GPT-4-8k/chat/completions?api-version=2023-07-01-preview", {
     method: "POST",
     headers: headers,
     body: data
    });
	console.log(response);
    const responseData = await response.json();
	*/
		 const headers = {
      "Content-Type": "application/json",
      "api-key": "dc9c7f26d3b047a58ce8bfedd2db8eab"
    };
  if (jsonFormat){
       data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      response_format:{"type": "json_object"},
      temperature: 0,
      max_tokens: 4000
    });
    
  }else{
    data = JSON.stringify({
      messages: [{"role": "user", "content": prompt}],
      temperature: 0,
      max_tokens:4000
  });
  }
  //const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/gpt-3-turbo/chat/completions?api-version=2023-07-01-preview", {
	  const response = await fetch("https://innovationhub-gpt4.openai.azure.com/openai/deployments/gpt-35-turbo-16k/chat/completions?api-version=2023-07-01-preview", {
     method: "POST",
     headers: headers,
     body: data
    });
  console.log(response);
    const responseData = await response.json();
	//https://api.openai.com/v1/chat/completions
	
	
	
    console.log("RES:"+responseData.toString());

    var responseContent = responseData.choices[0].message.content;
    //console.log("OLD = "+	responseContent);
	
	//responseContent = extractJSONString(responseContent);
	//console.log("NEW "+responseContent);

	
	// If the above operations succeed, mark the process as successful
    success = true;

    // All data rows are inserted successfully
    //return Promise.resolve();
	return responseContent;
  } catch (err) {
    console.error('Error processing prompt data:', err);
	await sleep(10000); // 5000 milliseconds = 5 seconds
      retryCount++;
    //throw err;
  }
}
	if (!success) {
		console.error('Failed after multiple retries. Aborting.');
		// Optionally, you can throw an error here or perform any other action.
		throw new Error('Failed after multiple retries. Aborting.');
    }
}

app.post('/generateEmail' , async (req, res) => {
  try {
	console.log("generateEmail...."+req.query.language);  
   
     var claimDetails = fs.readFileSync(path.join(__dirname, 'uploads', "extractedFields.txt"), 'utf8');
     
	 var prompt = "You are an professional insurance officer. Based on the below claim details write an email reply directed to the Claimant. Let them know whether the claim has been approved or declined, or if more information is needed. Reply in thorough and professional manner. {chineseModifier}. End the email with 'Kind Regards,\nJacob Chan, Claims Officer. Start the email with 'Dear {ClaimerName}'. The claim details are below \n"+claimDetails;

if (req.query.language == "Chinese"){
    prompt = prompt.replace("{chineseModifier}", "YOU MUST REPLY IN CHINESE");
  } else {
    prompt = prompt.replace("{chineseModifier}", "");
  }

	 var reply = await processPromptData(prompt,false);
	  

	
	    // Send the dictionary as JSON response
    return res.send(reply);
    //return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});


app.post('/loadPolicyDoc', upload.array('pdfs[]'), async (req, res) => {
  try {
	console.log("UPLOADING....");  
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).send('No PDF files uploaded.');
    }

    const fileNames = uploadedFiles.map((file) => decodeURIComponent(file.originalname));
    const filePaths = uploadedFiles.map((file) => file.path);

    //for (let i = 0; i < uploadedFiles.length; i++) {
	  console.log("READ: "+filePaths[0]);
      const pdfText = await getPDFText(filePaths[0]);
      fs.writeFileSync(path.join(__dirname, 'uploads', "policy.txt"), pdfText);
	  await langchainFunctions.langchainCreateVectorStore("uploads\\" + "policy.txt");
	  
      // Insert the uploaded file's name into the "uploadInfo" table
      console.log('Inserting into uploadinfo ' + fileNames[0]);    
      //await processPromptData(pdfText, req.body.medicineInput, fileNames[i], '');
	  
	
    return res.status(200).send("done");
    //return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

app.post('/answerQuestion', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
	
  var productsPath = "insuranceHelperChatbot/PolicyDetailsSumary.txt";
  if (req.query.language == "Chinese"){
       productsPath = "insuranceHelperChatbot/PolicyDetailsSumary.txt";
  }else{
     productsPath = "insuranceHelperChatbot/PolicyDetailsSumary-English.txt";
  }
	const products = await fs.promises.readFile(productsPath, 'utf8');
	
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner and you must limit your knowledge to the below knowledge base.: "+clientAnswer+",\n  {chineseModifier}. Knowledge Base: Insurance product list: "+products;

if (req.query.language == "Chinese"){
      prompt = prompt.replace("{chineseModifier}", "answer MUST be in chinese");
    } else {
           prompt = prompt.replace("{chineseModifier}", "");
    }

	var result = await processPromptData(prompt,false);
	console.log(result);
	return res.status(200).send(result);
	
  });
  
  app.post('/answerInsuranceQuestion', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
  var language = req.query.language;
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner: "+clientAnswer+",\n.Reply in 50 or less words.  {chineseModifier}";
if(language=="Chinese"){
  prompt = prompt.replace("{chineseModifier}", "answer MUST be in chinese");
} else {
  prompt = prompt.replace("{chineseModifier}", "");
}
	var result = await processPromptDataCustomToken  (prompt,false,300);
	console.log(result);
	return res.status(200).send(result);
	
  });

//upload.array() = THIS IS TO ALLOW REQ.BODY!!!
app.post('/performanceAnalysis', upload.array(), async(req,res)=>{
  
  var skills = req.query.skills;
  var candidateAnswer = req.body.candidateAnswers;
  console.log(candidateAnswer);
  //var language = req.query.language;
  console.log("reading...");
  var markScheme = fs.readFileSync("quiz.txt", 'utf8');
  markScheme = markScheme.replace(/\n/g, ' ');

  var prompt = `This is a quiz on the following skills: ${skills}. Based on the candidate answers, give a rating of each skill out of 5.Quiz questions and correct answers: ${markScheme}. Candidate answers:${candidateAnswer} .Give answer in this format: {"SkillName":"Rating","SkillName":"Rating"}`
;


  //var prompt = fs.readFileSync("prompt.txt", 'utf8');

console.log(prompt);
  var result = await processPromptDataCustomToken(prompt,false,1500);
console.log(result);
  return res.status(200).send(result);
})

 app.post('/generateQuiz', async (req, res) => {
  var topics =req.query.topics;
  var language = req.query.language;
  var prompt = `For the following topics: ${topics}, create an MCQ quiz, the questions must be advanced level or above as we are testing professionals and not beginners. There should be 10 questions in total, with 4 options per question. Give the answer in the following JSON format:
[{"Question":"","Option1":"","Option2":"","Option3":"","Option4":"","Answer":""},{"Question":"","Option1":"","Option2":"","Option3":"","Option4":"","Answer":""}] . {chineseModifier}`
;
if(language=="Chinese"){
  prompt = prompt.replace("{chineseModifier}", "The question and options must be in Chinese.");
} else {
  prompt = prompt.replace("{chineseModifier}", "");
}
  var result = await processPromptDataCustomToken  (prompt,false,2000);

      fs.writeFileSync('quiz.txt', result);

  console.log(result);
  return res.status(200).send(result);
  
  });


app.post('/recommendTraining', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
	var trainType = req.query.trainType;
  var language = req.query.language;
	
	var prompt = `You are an professional insurance training assistant. Based on the clients chosen type of training: "+trainType+" and their experience and preferences: " + clientAnswer+".  Recommend 4 training classes for them. Give your answer in the following JSON format: [{"Name":"","Summary":""},{"Name":"","Summary":""},{"Name":"","Summary":""},{"Name":"","Summary":""}] {chineseModifier}`
if(language=="Chinese"){
  prompt = prompt.replace("{chineseModifier}", "Note that the JSON values MUST be in chinese.");
} else {
  prompt = prompt.replace("{chineseModifier}", "");
}
	var result = await processPromptDataCustomToken(prompt,false, 1000);
	console.log(result);
	result = result.match(/\[[\s\S]*\]/)[0];
	return res.status(200).send(result);
	
  });

app.post('/recommendPackages', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
  var productsPath = "insuranceHelperChatbot/PolicyDetailsSumary.txt";
	if (req.query.language == "Chinese"){
       productsPath = "insuranceHelperChatbot/PolicyDetailsSumary.txt";
  }else{
     productsPath = "insuranceHelperChatbot/PolicyDetailsSumary-English.txt";
  }
	
	const products = await fs.promises.readFile(productsPath, 'utf8');
	
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner. You have asked the client about their Gender, Age, Annual Income, medical history and Non-liquid Assets. Client has replied with " + clientAnswer+".  Based on their answer, recommend the top three insurance products from the below list. Give your answer in the following JSON format: [{'Name':'','Summary':'','Cost':'','Insured Age Range':'','Guarantee Period':'','Reason':'Reasons why this product is suitable based on the answer','Details':'Give details and features of this product'},{'Name':'','Summary':'','Cost':'','Insured Age Range':'','Guarantee Period':'','Reason':'Reasons why this product is suitable based on the answer','Details':'Give details and features of this product'},{'Name':'','Summary':'','Cost':'','Insured Age Range':'','Guarantee Period':'','Reason':'Reasons why this product is suitable based on the answer','Details':'Give details and features of this product'}] {chineseModifier} \nInsurance product list: "+products;

    if (req.query.language == "Chinese"){
      prompt = prompt.replace("{chineseModifier}", "Note that the JSON values MUST be in chinese.");
    } else {
           prompt = prompt.replace("{chineseModifier}", "Note that the JSON values MUST be in english.");
    }

	var result = await processPromptDataCustomTokenGPT4(prompt,false,4000);
	console.log(result);
	result = result.match(/\[[\s\S]*\]/)[0];
	return res.status(200).send(result);
	
  });

app.post('/startSimulation', async (req, res) => {
    const scriptPath = "simulation.txt";
  fs.unlink(scriptPath, (err) => {
  if (err) {
    console.log('Error deleting the file:', err);
    //return;
  }
  console.log('File deleted successfully');
});

 var prompt = `You are a ${req.query.target} in a conversation with an insurance officer about a scenario related to insurance. Come up with an enquiry to the insurance officer, {chineseModifier}`



    if (req.query.language == "Chinese"){
      prompt = prompt.replace("{chineseModifier}", "Write the enquiry in Chinese");
    } else {
           prompt = prompt.replace("{chineseModifier}", "");
    }

  var result = await processPromptDataCustomTokenGPT4(prompt,false,1000);


fs.writeFile(scriptPath, "You: "+result, 'utf8', (err) => {
    if (err) {
      console.error('Error appending line to file:', err);
      return;
    }
    console.log('Line appended to file successfully');
  });
return res.status(200).send(result);
});

app.post('/generateSimulation', async (req, res) => {

  const scriptPath = "simulation.txt";
  var conversationHistory = await fs.promises.readFile(scriptPath, 'utf8');  

  var target =req.query.target;
  var question =req.query.clientAnswer; 

  conversationHistory = `${conversationHistory}\nOfficer:${question}`;
  

  //var prompt = `You are an professional insurance officer. Based on the specified target client: ${target}, generate a simulated conversation between the client and an insurance officer. The scenario can be something the target client faces on a daily basis for example if the target client is a young family, the scenario can be where they have a child and are asking about what life insurance they should purchase. Give your answer in the following JSON format: [{"Client":"","Agent":""},{"Client":"","Agent":""}]. {chineseModifier}`



  var prompt = `You are a ${target}) in a conversation with an insurance officer. Based on the conversation history here below, Come up with the next reply. In this format: {"Reply": ""} . {chineseModifier}

Conversation History:
${conversationHistory}`

    if (req.query.language == "Chinese"){
      prompt = prompt.replace("{chineseModifier}", "The JSON values MUST be in chinese");
    } else {
           prompt = prompt.replace("{chineseModifier}", "");
    }

  var result = await processPromptDataCustomToken(prompt,false,1000);
    //const responseData = await result.json();
  //console.log(responseData);
   console.log(result);
  //result = result.match(/\[[\s\S]*\]/)[0];
conversationHistory = `${conversationHistory}\nYou:${JSON.parse(result).Reply}`;
// Writing the updated content back to the file
  fs.writeFile(scriptPath, conversationHistory, 'utf8', (err) => {
    if (err) {
      console.error('Error appending line to file:', err);
      return;
    }
    console.log('Line appended to file successfully');
  });

  return res.status(200).send(JSON.parse(result).Reply);
  
  });
app.post('/generateCustomSimulation', async (req, res) => {
  var target =req.query.target;
  var scenario = req.query.scenario;
console.log(target);
  var prompt = `You are an professional insurance officer. Based on the specified target client: ${target}, generate a simulated conversation between the client and an insurance officer. The scenario is the following: ${scenario}. Give your answer in the following JSON format: [{"Client":"","Agent":""},{"Client":"","Agent":""}]. The JSON values MUST be in chinese`

  var result = await processPromptDataCustomToken(prompt,false,1000);
  console.log(result);
  result = result.match(/\[[\s\S]*\]/)[0];
  return res.status(200).send(result);
  
  });

app.post('/uploadMultiplePolicyDocs', upload.array('pdfs[]'), async (req, res) => {
  try {
	console.log("UPLOADING....");  
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).send('No PDF files uploaded.');
    }

    const fileNames = uploadedFiles.map((file) => decodeURIComponent(file.originalname));
    const filePaths = uploadedFiles.map((file) => file.path);

    for (let i = 0; i < uploadedFiles.length; i++) {
	  console.log("READ: "+filePaths[i]);
      const pdfText = await getPDFText(filePaths[i]);
      fs.writeFileSync(path.join(__dirname, 'uploads', fileNames[i]), pdfText);
	  //await langchainFunctions.langchainCreateVectorStore("uploads\\" + path.basename(fileNames[i]).replace('.pdf', '.txt'));
	  
	  
      // Insert the uploaded file's name into the "uploadInfo" table
      console.log('Inserting into uploadinfo ' + fileNames[0]);    
      //await processPromptData(pdfText, req.body.medicineInput, fileNames[i], '');
	  
	const scriptPath = "insuranceHelperChatbot/ExtractPolicyDetails.txt";
	const promptData = await fs.promises.readFile(scriptPath, 'utf8');
    let prompt = promptData;
    prompt = prompt.replace("{text}", pdfText);
    fs.writeFileSync('test.txt', prompt);
	var result = await processPromptData(prompt);
	result = result.match(/\{[\s\S]*?\}/)[0];
	      const extractedFields = JSON.parse(result);
    console.log(extractedFields);
	  //var policyTxt = fs.readFileSync(path.join(__dirname, 'uploads', "policy.txt"), 'utf8');
	  //enable on publish
	  
	  var extractedFieldsTxt = "";
	  
	  for (const key in extractedFields) {
	  //if (dictionary.hasOwnProperty(key)) {
		  extractedFieldsTxt = extractedFieldsTxt + key + ": " + extractedFields[key]+"\n";
		//const value = dictionary[key];
		//console.log(`Key: ${key}, Value: ${value}`);
	  //}
	  }
	  
	  fs.writeFileSync(path.join(__dirname, 'uploads', "extractedFields.txt"), extractedFieldsTxt);
	  //await langchainFunctions.langchainCreateVectorStore("uploads\\pdfTxt.txt");
    }
	console.log(extractedFields);
	 const responseData = {
      extracted: extractedFields,
	  extracted1: "ABD"
    };
	
	    // Send the dictionary as JSON response
    return res.status(200).json(responseData);
    //return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

app.post('/upload', upload.array('pdfs[]'), async (req, res) => {
  try {
	console.log("UPLOADING....");  
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).send('No PDF files uploaded.');
    }

    const fileNames = uploadedFiles.map((file) => decodeURIComponent(file.originalname));
    const filePaths = uploadedFiles.map((file) => file.path);

    //for (let i = 0; i < uploadedFiles.length; i++) {
	  console.log("READ: "+filePaths[0]);
      const pdfText = await getPDFText(filePaths[0]);
      //fs.writeFileSync(path.join(__dirname, 'uploads', "pdfTxt.txt"), pdfText);
	  //await langchainFunctions.langchainCreateVectorStore("uploads\\" + path.basename(fileNames[i]).replace('.pdf', '.txt'));
	  
                                              
      // Insert the uploaded file's name into the "uploadInfo" table
      console.log('Inserting into uploadinfo ' + fileNames[0]);    
      //await processPromptData(pdfText, req.body.medicineInput, fileNames[i], '');
	  
	const scriptPath = "extractDetailsPrompt.txt";
	const promptData = await fs.promises.readFile(scriptPath, 'utf8');
    let prompt = promptData;
    prompt = prompt.replace("{txt}", pdfText);
	prompt = prompt.replace("{policy}", req.body.policy);
	prompt = prompt.replace("{coverage}", req.body.coverage);

  if (req.body.language == "Chinese"){
    prompt = prompt.replace("{chineseModifier}", "The values of the JSON MUST be in Chinese simplified. ");
  } else {
    prompt = prompt.replace("{chineseModifier}", "");
  }


    fs.writeFileSync('test.txt', prompt);
	var result = await processPromptData(prompt, false);
	result = result.match(/\{[\s\S]*?\}/)[0];
	      const extractedFields = JSON.parse(result);
    console.log(extractedFields);
	  //var policyTxt = fs.readFileSync(path.join(__dirname, 'uploads', "policy.txt"), 'utf8');
	  //enable on publish
	  
	  var extractedFieldsTxt = "";
	  
	  for (const key in extractedFields) {
	  //if (dictionary.hasOwnProperty(key)) {
		  extractedFieldsTxt = extractedFieldsTxt + key + ": " + extractedFields[key]+"\n";
		//const value = dictionary[key];
		//console.log(`Key: ${key}, Value: ${value}`);
	  //}
	  }
	  
	  fs.writeFileSync(path.join(__dirname, 'uploads', "extractedFields.txt"), extractedFieldsTxt);
	  //await langchainFunctions.langchainCreateVectorStore("uploads\\pdfTxt.txt");
    //}
	console.log(extractedFields);
	 const responseData = {
      extracted: extractedFields,
	  extracted1: "ABD"
    };
	
	    // Send the dictionary as JSON response
    return res.status(200).json(responseData);
    //return res.status(200).send('Upload and processing successful.');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Internal Server Error');
  }
});


//app.listen(port, () => {
//  console.log(`Server is running on http://localhost:${port}`);
//});
app.use('/', express.static(__dirname));
app.use(express.json())    // <==== parse request body as JSON 
const server = http.createServer(app);
console.log(port);
server.listen(port, () => console.log('Server started on port localhost:3000'));