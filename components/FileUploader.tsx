"use client"

import React, { useCallback, JSX } from 'react'
import { useDropzone } from 'react-dropzone'
import {
    CheckCircleIcon,
    // CircleArrowDown,
    // HammerIcon,
    RocketIcon,
    SaveIcon,
    Upload, LoaderPinwheel
} from "lucide-react";
import useUpload, { StatusText } from "../hooks/useUpload"
import { useRouter } from 'next/navigation';
import useSubscription from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

function FileUploader() {
    const router = useRouter()
    const { progress, status, fileId, handleUpload } = useUpload();
    const { isOverFileLimit, filesLoading } = useSubscription()
    const { toast } = useToast()
    React.useEffect(() => {
        if (fileId) {
            // if file id present means file present so push
            router.push(`/dashboard/files/${fileId}`)
        }
    }, [fileId, router])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            // if not over the file limit
            if (!isOverFileLimit && !filesLoading) {
                await handleUpload(file)
            } else {
                toast({
                    variant: "destructive",
                    title: "Free Plan Limit Reached",
                    description:
                        "You have reached the maximum number of files allowed for your account. Please upgrade to add more documents.",
                })
            }

        } else {
            // do nothing...
            // for pro and free
        }
    }, [handleUpload,filesLoading,toast,isOverFileLimit])


    const statusIcons: {
        [key in StatusText]: JSX.Element;
    } = {
        [StatusText.UPLOADING]: (
            <RocketIcon className="h-20 w-20 text-indigo-600 animate-ping" />
        ),
        [StatusText.UPLOADED]: (
            <CheckCircleIcon className="h-20 w-20 text-indigo-600" />
        ),
        [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-indigo-600" />,
        [StatusText.GENERATING]: (
            <LoaderPinwheel className="h-20 w-20 text-indigo-600 animate-spin" />
        ),
    };



    const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            "application/pdf": [".pdf"],
        }
    })

    const uploadedProgress = progress != null && progress >= 0 && progress <= 100;


    return (
        <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
            {/* loading secition */}
            {uploadedProgress && (
                <div className="mt-32 flex flex-col justify-center items-center gap-5">
                    <div className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4 ${progress === 100 && "hidden"
                        }`}
                        role="progressbar"
                        style={{
                            // @ts-expect-error: sample description
                            "--value": progress,
                            "--size": "12rem",
                            "--thickness": "1.3rem",
                        }} >
                        {progress}%
                    </div>
                    {/* Render status icon */}

                    {
                        // @ts-expect-error: sample description
                        statusIcons[status!]
                    }

                    <p className="text-indigo-600 animate-pulse">{!status}</p>

                </div>
            )}

            {!uploadedProgress && (
                <div {...getRootProps()}
                    className={`p-10 border-indigo-600 text-indigo-600 border-2 shadow-lg
                border-solid mt-10 w-[90%] rounded-lg h-96 flex items-center justify-center
                ${isFocused || isDragAccept ?
                            "bg-indigo-300" : "white"
                        }`}>

                    <input {...getInputProps()} />
                    <div className='flex flex-1 flex-col items-center justify-center'>
                        {isDragActive ? (
                            <>
                                <RocketIcon className="h-20 w-20 animate-ping" />
                                <p>Drop the files here ...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-20 w-20 animate-pulse" />
                                <p>Drag n drop some files here, or click to select files</p>
                            </>
                        )}
                    </div>

                </div>
            )}

        </div>

    )
}

export default FileUploader