"use server"
// server action
// 
import {auth} from "@clerk/nextjs/server"
import { generateEmbeddingsInPineconeVectorStore } from "../lib/langchain";
import { revalidatePath } from "next/cache"
import {Pinecone} from "@pinecone-database/pinecone"

export async function generateEmbeddings(docId:string){
    // to ensure authenticated users can access the functionality
    auth().protect() //people not authenticated or signed in wil be thorwin

    // generate embeddings in pinecone vector-store
    // turn pdf to embeddings here
    // embeddings are string or vector of numbers
    // llm use these vectors 

    // pinecone is a vector database, openAi embeding model does embeddings for us

    await generateEmbeddingsInPineconeVectorStore(docId)

    revalidatePath("/dashboard");

    return {completed:true};
}