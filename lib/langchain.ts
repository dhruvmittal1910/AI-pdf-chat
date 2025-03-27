// need access to openAI

// initialize openAI model

import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
// import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "../firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
// import { split } from "postcss/lib/list";
// import { chat } from "@pinecone-database/pinecone/dist/assistant/data/chat";

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini"
})

export const indexName = "pdf-chat-dhruv"


async function fetchMessagesFromDb(docId: string) {
    const { userId } = await auth();
    if (!userId) { throw new Error("no user found") }

    // fetch msg
    console.log("----fetching chat history from firestore database")
    // get last 7 messages
    // const LIMIT = 7
    const chats = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .collection("chat")
        .orderBy("createdAt", "desc")
        // .limit(LIMIT)
        .get()

    // map chathistroy into a format that langchain can understand
    const chathistory = chats.docs.map((doc) =>
        doc.data().role === "human"
            ? new HumanMessage(doc.data().message)
            : new AIMessage(doc.data().message)
    )

    console.log(`---fetched last ${chathistory.length} successfully---`)
    console.log(chathistory.map((msg) => msg.content.toString()));
    return chathistory

}

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) throw new Error("user not found")
    // using firebase admin 

    console.log("----Fetching Downloaded Url from Firebase----")
    const FirebaseRef = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .get();

    const downloadUrl = FirebaseRef.data()?.downloadUrl;

    if (!downloadUrl) {
        throw new Error("Download URL not found");
    }

    console.log("firebaseref fetch the download url", downloadUrl)

    // download the pdf
    const response = await fetch(downloadUrl);

    // load pdf document 
    const data = await response.blob();

    const loader = new PDFLoader(data);
    const docs = await loader.load();

    // split the doc into chunks
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`split docs length : ${splitDocs.length}`)

    return splitDocs


}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
    // if no namespace or no doc
    if (namespace === null) throw new Error("no new namespace provided or no new doc provided")

    const { namespaces } = await index.describeIndexStats();
    // above const returns array of namespaces or docs

    // below we check if the doc or namespace we provided is existing or not
    return namespaces?.[namespace] !== undefined
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User Not Found")
    }
    let pineconeVectorStore;

    // generating embeddings
    console.log("----Embeddings Generation----")
    const embeddings = new OpenAIEmbeddings();

    const index = await pineconeClient.index(indexName)
    // namespace means docId with respect to pinecone
    // check if doc exists or not, will return true or false
    const namespaceAlreadyExists = await namespaceExists(index, docId);

    // we are generating embeddings only once
    if (namespaceAlreadyExists) {
        console.log(`------Using Existing Embeddings from ${docId}-------`)
        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId
        })

        return pineconeVectorStore;
    } else {
        // download from firestore
        // if docId or namespace doesnt exists , download pdf from firestore
        // via the stored embeddings and store them in pinecone vector store
        // spilt the pdf into documents
        const splitDocs = await generateDocs(docId)

        // generating and store docs
        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs,
            embeddings,
            {
                pineconeIndex: index,
                namespace: docId,
            }
        );
        return pineconeVectorStore
    }

}

const generateLangchainCompletion = async (docId: string, question: string) => {
    // let pineconeVectorStore;

    const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
    // create a retriever, that searches through vector store
    console.log("---Creating a Retriver---")

    if (!pineconeVectorStore) {
        throw new Error("no pineconce vector found")
    }

    const retriever = pineconeVectorStore.asRetriever();
    // retriever is an object now
    // fetch database messages to give the ai context to correctly ans
    // input to ai will be pdf embeddings, my prev chat msgs and more

    // get chathistory from db
    const chatHistory = await fetchMessagesFromDb(docId);

    // Define a prompt template for generating search queries based on conversation history
    console.log("--- Defining a prompt template... ---");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory, // Insert the actual chat history here

        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
        ],
    ]);

    // Create a history-aware retriever chain that uses the model, retriever, and prompt
    console.log("--- Creating a history-aware retriever chain... ---");
    // this chain maintain the chat history     
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    });

    // Define a prompt template for answering questions based on retrieved context

    console.log("--- Defining a prompt template for answering questions... ---");
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ],

        ...chatHistory, // Insert the actual chat history here

        ["user", "{input}"],
    ]);

    // Create a chain to combine the retrieved documents into a coherent response
    console.log("--- Creating a document combining chain... ---");
    // it takes the prompt from retrieval prompt above 
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm: model,
        prompt: historyAwareRetrievalPrompt,
    });

    // Create the main retrieval chain that combines the history-aware retriever and document combining chains
    console.log("--- Creating the main retrieval chain... ---");
    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCombineDocsChain,
    });

    console.log("--- Running the chain with a sample conversation... ---");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history: chatHistory,
        input: question,
    });

    // Print the result to the console
    console.log(reply.answer);
    return reply.answer;

}

export {model,generateLangchainCompletion};