// app.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
//const fetch = require('node-fetch');
const PDFParser = require('pdf-parse');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
//const  PDFExtract = require('pdf-extraction');
//const pdfjsLib = require('pdfjs-dist');
const path = require('path');
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

//

app.post('/processSingleQuestionLangchain', async (req, res) => {
	console.log("A");
	//console.log("PDFPTEXT " +pdfText);
	try {
	var claimDetails = fs.readFileSync(path.join(__dirname, 'uploads', "extractedFields.txt"), 'utf8');
	var question = "You are an professional insurance officer. Answer the following question in a professional and thorough manner based on the context provided: "+req.query.question + ". Your response MUST be in Chinese Simplified. Also take into account the details of the current claim: "+claimDetails ;
	console.log("QL + "+question);
	var answerTxt = await langchainFunctions.langchainProcessOneQuestion("policy.txt", question);
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


async function processPromptDataCustomToken(prompt, jsonFormat, max_tokens) {
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
      model: "gpt-3.5-turbo-16k",
      response_format:{"type": "json_object"},
      temperature: 0.5,
      max_tokens: 4000
    });
    
  }else{
        data = JSON.stringify({
        messages: [{"role": "user", "content": prompt}],
        model: "gpt-3.5-turbo-16k",
        temperature: 0.5,
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
		  model: "gpt-3.5-turbo-16k",
		  response_format:{"type": "json_object"},
		  temperature: 0.5,
		  max_tokens: 4000
    });
		
	}else{
		    data = JSON.stringify({
			  messages: [{"role": "user", "content": prompt}],
			  model: "gpt-3.5-turbo-16k",
			  temperature: 0.5,
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

app.get('/generateEmail' , async (req, res) => {
  try {
	console.log("generateEmail....");  
   
     var claimDetails = fs.readFileSync(path.join(__dirname, 'uploads', "extractedFields.txt"), 'utf8');
     
	 var prompt = "You are an professional insurance officer. Based on the below claim details write an email reply directed to the Claimant. Let them know whether the claim has been approved or declined, or if more information is needed. Reply in thorough and professional manner. YOU MUST REPLY IN CHINESE. End the email with 'Kind Regards,\nJacob Chan, Claims Officer. Start the email with 'Dear {ClaimerName}'. The claim details are below \n"+claimDetails;
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
	
	const productsPath = "insuranceHelperChatbot/PolicyDetailsSumary.txt";
	const products = await fs.promises.readFile(productsPath, 'utf8');
	
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner and you must limit your knowledge to the below knowledge base.: "+clientAnswer+",\.  answer MUST be in chineseKnowledge Base: Insurance product list: "+products;

	var result = await processPromptData(prompt,false);
	console.log(result);
	return res.status(200).send(result);
	
  });
  
  app.post('/answerInsuranceQuestion', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
	
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner: "+clientAnswer+",\.  answer MUST be in chinese";

	var result = await processPromptDataCustomToken  (prompt,false,1000);
	console.log(result);
	return res.status(200).send(result);
	
  });

app.post('/recommendTraining', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
	var trainType = req.query.trainType;
	
	var prompt = "You are an professional insurance training assistant. Based on the clients chosen type of training: "+trainType+" and their experience and preferences: " + clientAnswer+".  Recommend 4 training classes for them. Give your answer in the following JSON format: [{'Name':'','Summary':''},{'Name':'','Summary':''},{'Name':'','Summary':''},{'Name':'','Summary':''}] Note that the JSON values MUST be in chinese."

	var result = await processPromptData(prompt,false);
	console.log(result);
	result = result.match(/\[[\s\S]*\]/)[0];
	return res.status(200).send(result);
	
  });

app.post('/recommendPackages', async (req, res) => {
	var clientAnswer =req.query.clientAnswer;
	
	const productsPath = "insuranceHelperChatbot/PolicyDetailsSumary.txt";
	const products = await fs.promises.readFile(productsPath, 'utf8');
	
	var prompt = "You are an professional insurance officer. Answer the following question in a professional and thorough manner. You have asked the client about their Gender, Age, Annual Income, medical history and Non-liquid Assets. Client has replied with " + clientAnswer+".  Based on their answer, recommend the top three insurance products from the below list. Give your answer in the following JSON format: [{'Name':'','Summary':'','Cost':'','Insured Age Range':'','Guarantee Period':'','Reason':'Reasons why this product is suitable based on the answer','Details':'Give details and features of this product'},{'Name':'','Summary':'','Cost':'','Insured Age Range':'','Guarantee Period':'','Reason':'Reasons why this product is suitable based on the answer','Details':'Give details and features of this product'},{'Name':'','Summary':'','Cost':'','Insured Age Range':'','Guarantee Period':'','Reason':'Reasons why this product is suitable based on the answer','Details':'Give details and features of this product'}] Note that the JSON values MUST be in chinese. \nInsurance product list: "+products;

	var result = await processPromptData(prompt,false);
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
const server = http.createServer(app);
console.log(port);
server.listen(port, () => console.log('Server started on port localhost:3000'));