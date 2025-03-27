"use client"
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react'
import byteSize from "byte-size"
import { Button } from './ui/button';
import { TrashIcon, DownloadIcon } from 'lucide-react';
// import { url } from 'inspector';
// import {deleteDocument} from "@actions/deleteDocument"
import useSubscription from "../hooks/useSubscription"
import { deleteDocument } from "@/actions/deleteDocument"
import NewDoc from './NewDoc';



function Document({
    id,
    name,
    size,
    downloadUrl,
}: {
    id: string;
    name: string;
    size: number;
    downloadUrl: string;
}) {

    const router = useRouter()
    const [isDeleting, startTransition] = useTransition();
    const { hasActiveMembership } = useSubscription();


    return (
        <div className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group">

            <div
                className="flex-1"
                onClick={() => {
                    router.push(`/dashboard/files/${id}`);
                }}
            >

                <p className="font-semibold line-clamp-2">{name}</p>
                <p className="text-sm text-gray-500 group-hover:text-indigo-100">
                    {/* render size in kbs */}
                    {byteSize(size).value} KB
                </p>
            </div>


            <div className='h-70 w-auto  overflow-y-hidden shadow-lg  rounded-lg mb-3'>
                <NewDoc id={id} name={name} size={size} downloadUrl={downloadUrl} />
            </div>





            {/* Actions */}
            <div className='flex space-x-2 justify-end'>

                {/* delete the pdf */}
                <Button variant="outline"
                    className='bg-white shadow-lg'
                    disabled={isDeleting || !hasActiveMembership}
                    onClick={() => {
                        const prompt = window.confirm("Are you sure ?")
                        if (prompt) {
                            // delete
                            startTransition(async () => {
                                await deleteDocument(id)
                            })
                        }
                    }}>
                    <TrashIcon className="h-6 w-6 text-red-500" />
                    {!hasActiveMembership && (
                        <span className="text-red-500 ml-2">PRO Feature</span>
                    )}
                </Button>

                {/* Download the pdf */}
                <Button variant="outline" asChild
                    className='bg-white shadow-lg'>
                    <a href={downloadUrl} download>
                        <DownloadIcon className="h-6 w-6 text-red-500" />
                    </a>

                </Button>

            </div>
        </div>
    )
}

export default Document