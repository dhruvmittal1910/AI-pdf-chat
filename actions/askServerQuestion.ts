"use server"
import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
// we are doing use server as we are doing a server action
import { auth } from "@clerk/nextjs/server"
import { generateLangchainCompletion } from "@/lib/langchain"
// import { useRef} from "react";
// import { FREE_LIMIT } from "@/hooks/useSubscription";
// import { PRO_LIMIT } from "@/hooks/useSubscription";


const PRO_LIMIT = 20
const FREE_LIMIT = 2

export async function askServerQuestion(id: string, question: string) {
    // protext
    auth().protect()
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User ID is null");
    }
    // get a chat ref where we have stored our chat messages
    const chatRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(id)
        .collection("chat")

    // get the chat itslef 
    const chatSnap = await chatRef.get();
    const userMessages = chatSnap.docs.filter(
        (doc) => doc.data().role === "human"
    )

    // get user document
    const userRef = await adminDb.collection("users").doc(userId).get()
    // if has active membership then fine

    // limit free/pro users accordingly
    if (!userRef.data()?.hasActiveMembership) {
        // if no active membership so stall the use
        if (userMessages.length >= FREE_LIMIT) {
            return {
                success: false,
                message: `You will need to upgrade to PRO account for more than ${FREE_LIMIT} questions`
            }
        }
    }

    // check if pro plan and user asked more than pro limit
    if(userRef.data()?.hasActiveMembership){
        // means pro
        if(userMessages.length>=100){
            return {
                success:false,
                message:`You have reached the PRO limit of ${PRO_LIMIT} questions`
            }
        }
    }


    const userMessage: Message = {
        role: "human",
        message: question,
        createdAt: new Date()
    }
    // add the user message to db
    await chatRef.add(userMessage)

    // generate the ai response
    const reply = await generateLangchainCompletion(id, question)

    const aiMessage: Message = {
        role: "ai",
        message: reply,
        createdAt: new Date()
    }

    await chatRef.add(aiMessage)

    return { success: true, message: null }

}