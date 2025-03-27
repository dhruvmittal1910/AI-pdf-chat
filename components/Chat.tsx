"use client"
import React from 'react'
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
// import ChatMessage from "./ChatMessage";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { askServerQuestion } from "@/actions/askServerQuestion";
import ChatMessage from "./ChatMessage";
import { useToast } from '@/hooks/use-toast';
// import { useToast } from "./ui/use-toast";


// the outline of how a message will look like
export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
};

function Chat({ id }: { id: string }) {
    const { user } = useUser()
    const { toast } = useToast()

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();

    const bottomOfChatRef = useRef<HTMLDivElement>(null);
    const [snapshot, loading] = useCollection(
        // only run this if user present
        user &&
        query(
            collection(db, "users", user?.id, "files", id, "chat"),
            orderBy("createdAt", "asc")
        )
    )
    useEffect(() => {
        bottomOfChatRef.current?.scrollIntoView({
            behavior: "smooth"
        })
    }, [messages])

    useEffect(() => {
        if (!snapshot) return;
        console.log("snapshot updaated", snapshot.docs)

        const lastMessage = messages.pop();

        if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
            // return as this is a dummy placeholder
            return
        }

        const newMessages = snapshot.docs.map(doc => {
            const { role, message, createdAt } = doc.data();
            return {
                id: doc.id,
                role,
                message,
                createdAt: createdAt.toDate()
            }
        })

        setMessages(newMessages)

    }, [snapshot])



    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // copy input into a variable
        const temp = input;
        setInput("");
        setMessages((prev) => [
            ...prev,
            // add my question 
            {
                role: "human",
                message: temp,
                createdAt: new Date(),
            },
            // here add Ai answer
            {
                role: "ai",
                message: "Thinking...",
                createdAt: new Date(),
            },
        ]);

        startTransition(async () => {
            // here we take our embeddings, use langchain to process our query to get response
            const { success, message } = await askServerQuestion(id, temp);
            if (!success) {
                // toast...
                if (success === false) {
                    // means reached limit of respective membership
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: message
                    })
                }
                setMessages((prev) =>
                    prev.slice(0, prev.length - 1).concat(
                        {
                            role: "ai",
                            message: `yooo...${message}`,
                            createdAt: new Date()
                        }
                    )
                )
            }
        })
    }


    // const { toast } = useToast()
    return (
        <div className='flex flex-col h-full overflow-scroll'>
            {/* chat contents */}
            <div className='flex-1 w-full'>
                {/* chat messages */}
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
                    </div>
                ) : (
                    <div className="p-5">
                        {messages.length === 0 && (
                            <ChatMessage
                                key={"placeholder"}
                                message={{
                                    role: "ai",
                                    message: "Ask me anything about the document!",
                                    createdAt: new Date(),
                                }}
                            />
                        )}

                        {messages.map((message, index) => (
                            <ChatMessage key={index} message={message} />
                        ))}

                        <div ref={bottomOfChatRef} />
                    </div>

                )}
            </div>
            <form onSubmit={handleSubmit}
                className='flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75 rounded-lg'>
                <Input
                    placeholder='Ask A Question...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button type='submit' disabled={!input || isPending}>
                    {isPending ? (
                        <Loader2Icon className='animate-spin text-indigo-500' />
                    ) : (
                        "Ask"
                    )}
                </Button>
            </form>
        </div>
    )
}

export default Chat