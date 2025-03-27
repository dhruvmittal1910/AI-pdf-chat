"use client"
import React from 'react'
import { Button } from "./ui/button"
import { PlusCircleIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
function PlaceholderPodcast() {
    const router = useRouter();

    const handleClick = () => {
        // push user to add doc or upgrade page
        // check if user is free tier and if they have reached over
        // file limit if yes push to upgrade
        router.push('/dashboard/uploadVideo')
    }
    return (
        <Button onClick={handleClick} className="flex flex-col items-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400">
            <PlusCircleIcon />
            <p>Add A Video Link</p>
        </Button>
    )
}

export default PlaceholderPodcast