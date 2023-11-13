/*
// 1. Import document loaders for different file formats
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

// 2. Import OpenAI language model and other related modules
import { OpenAI } from "langchain/llms/openai";

import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// 3. Import Tiktoken for token counting
import { Tiktoken } from "@dqbd/tiktoken/lite";
import { load } from "@dqbd/tiktoken/load";
import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
import models from "@dqbd/tiktoken/model_to_encoding.json" assert { type: "json" };

// 4. Import dotenv for loading environment variables and fs for file system operations
import dotenv from "dotenv";
import fs from "fs";

import { basename } from 'path';
*/
// 1. Import document loaders for different file formats
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { JSONLoader } = require("langchain/document_loaders/fs/json");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");

// 2. Import OpenAI language model and other related modules
const { OpenAI } = require("langchain/llms/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

// 3. Import Tiktoken for token counting
const { Tiktoken } = require("@dqbd/tiktoken/lite");
const { load } = require("@dqbd/tiktoken/load");
const registry = require("@dqbd/tiktoken/registry.json");
const models = require("@dqbd/tiktoken/model_to_encoding.json");

// 4. Import dotenv for loading environment variables and fs for file system operations
const dotenv = require("dotenv");
const fs = require("fs");

const { basename } = require('path');


dotenv.config();

// 5. Initialize the document loader with supported file formats
/*
const loader = new DirectoryLoader("./documents", {
  ".json": (path) => new JSONLoader(path),
  ".txt": (path) => new TextLoader(path),
  ".csv": (path) => new CSVLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});
*/




//const loader = new TextLoader("src/document_loaders/example_data/example.txt");




// 7. Define a function to calculate the cost of tokenizing the documents
async function calculateCost(docs) {
  const modelName = "text-embedding-ada-002";
  const modelKey = models[modelName];
  const model = await load(registry[modelKey]);
  const encoder = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );
  const tokens = encoder.encode(JSON.stringify(docs));
  const tokenCount = tokens.length;
  const ratePerThousandTokens = 0.0004;
  const cost = (tokenCount / 1000) * ratePerThousandTokens;
  encoder.free();
  return cost;
}

const question = "Tell me about these docs";

// 8. Define a function to normalize the content of the documents
function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}

// create and store vector store only for future use!!!
//export const langchainCreateVectorStore = async (filePath) => {
async function langchainCreateVectorStore(filePath){
	
	const loader = new TextLoader(filePath);
	
	console.log("Loading docs...");
	const docs = await loader.load();
	console.log("Docs loaded.");
		
	console.log("LangchainIndexes\\"+basename(filePath));
	const VECTOR_STORE_PATH = "LangchainIndexes\\"+basename(filePath);
	
  // 10. Calculate the cost of tokenizing the documents
  console.log("Calculating cost...");
  const cost = await calculateCost(docs);
  console.log("Cost calculated:", cost);

  // 11. Check if the cost is within the acceptable limit
  if (cost <= 1) {
    // 12. Initialize the OpenAI language model
    const model = new OpenAI({
		openAIApiKey: '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'
	});

    let vectorStore;

      // 15. Create a new vector store if one does not exist
      console.log("Creating new vector store...");
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 250,
      });
      const normalizedDocs = normalizeDocuments(docs);
      const splitDocs = await textSplitter.createDocuments(normalizedDocs);

      // 16. Generate the vector store from the documents
      vectorStore = await HNSWLib.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings({
		openAIApiKey: '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'
		})
      );
      // 17. Save the vector store to the specified path
      await vectorStore.save(VECTOR_STORE_PATH);

      console.log("Vector store created.");
  } else {
    // 20. If the cost exceeds the limit, skip the embedding process
    console.log("The cost of embedding exceeds $1. Skipping embeddings.");
  }
}

// 9. Define the main function to run the entire process
//export const langchainProcessQuestions = async (filePath, questionListString) => {
async function langchainProcessQuestions(filePath, questionListString){
	const VECTOR_STORE_PATH = "LangchainIndexes\\"+basename(filePath);

    // 12. Initialize the OpenAI language model
    const model = new OpenAI({
		openAIApiKey: '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'
	});

    let vectorStore;

    // 13. Check if an existing vector store is available
    console.log("Checking for existing vector store...");
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      // 14. Load the existing vector store
      console.log("Loading existing vector store...");
      vectorStore = await HNSWLib.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings({
		openAIApiKey: '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'
	})
      );
      console.log("Vector store loaded.");
    }

    // 18. Create a retrieval chain using the language model and vector store
    console.log("Creating retrieval chain...");
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // 19. Query the retrieval chain with the specified question
    console.log("Querying chain...");
	var res;
    //res = await chain.call({ query: question });
    //console.log({ res });
	var questionList = questionListString.split('##');
	var answerList = [];
	
	for (var i = 0; i < questionList.length; i++) {
		var question = questionList[i].trim();
		res = await chain.call({ query: question });
		answerList.push(res.text);
		console.log({ res });
	}  
	console.log(answerList.join('##'));
	return answerList.join('##');
}

async function langchainProcessOneQuestion(filePath, question){
	const VECTOR_STORE_PATH = "LangchainIndexes\\"+filePath;

    // 12. Initialize the OpenAI language model
    const model = new OpenAI({
		openAIApiKey: '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'
	});

    let vectorStore;

    // 13. Check if an existing vector store is available
    console.log("Checking for existing vector store...");
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      // 14. Load the existing vector store
      console.log("Loading existing vector store...");
      vectorStore = await HNSWLib.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings({
		openAIApiKey: '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'
	})
      );;
      console.log("Vector store loaded.");
    }

    // 18. Create a retrieval chain using the language model and vector store
    console.log("Creating retrieval chain...");
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // 19. Query the retrieval chain with the specified question
    console.log("Querying chain..."+question);
	var res;
    //res = await chain.call({ query: question });
    //console.log({ res });
	res = await chain.call({ query: question });

	console.log({ res });
	return res.text;
}
//for them to be visible to app.js!!!!!
module.exports = {
  langchainCreateVectorStore,
  langchainProcessQuestions,
  langchainProcessOneQuestion
};

// 21. Run the main function
//processQuestions("uploads\\NASDAQ_AMAT_2022.txt", "whats the total revenue##whats the total profit");