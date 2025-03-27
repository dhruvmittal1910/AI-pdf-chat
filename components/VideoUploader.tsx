"use client"

import React from 'react'
// import { useDropzone } from 'react-dropzone'
import {
    // CheckCircleIcon,
    // CircleArrowDown,
    // HammerIcon,
    // RocketIcon,
    // SaveIcon,
    // Upload
} from "lucide-react";
import { Button } from './ui/button';
import { Input } from "./ui/input"
import { useRouter } from 'next/navigation';

function VideoUploader() {

    const router = useRouter();
     
    const handleClick=()=>{
        router.push('/dashboard/video')
    }
    return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
            {/* loading secition */}
            <div
                className={`p-10  border-2 shadow-lg
                border-solid mt-10 w-[90%] rounded-lg h-96 flex items-center justify-center
                `}>

                <div className='flex flex-1 flex-col items-center justify-center'>
                    <div className="flex w-full max-w-xl space-x-2">
                        <Input className=' shadow-lg' type="text" placeholder="Link..." />
                        <Button className='bg-indigo-600 shadow-lg ' onClick={handleClick}type="submit">SUBMIT</Button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default VideoUploader