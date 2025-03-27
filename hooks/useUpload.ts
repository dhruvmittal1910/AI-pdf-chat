"use client"

import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useUser } from "@clerk/nextjs"
import { v4 as uuidv4 } from "uuid"
import { db, storage } from "@/firebase"
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import { fileURLToPath } from 'url';
import { doc, setDoc } from "firebase/firestore"
import {generateEmbeddings} from "@/actions/generateEmbeddings"

export enum StatusText {
    UPLOADING = "Uploading File...",
    UPLOADED = "File Uploaded Successfully",
    SAVING = "Saving File to Database",
    GENERATING = "Generating... May Take a Few Seconds"
}

export type Status = StatusText[keyof StatusText]

function useUpload() {
    const [progress, setProgress] = useState<number | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const { user } = useUser();
    const router = useRouter();

    const handleUpload = async (file: File) => {
        if (!file || !user) {
            return;
        }
        // free/pro limitation..
        const fileIdToUploadTo = uuidv4();
        // firebase firestore
        const storageRef = ref(
            storage,
            `users/${user.id}/files/${fileIdToUploadTo}`
        )
        const uploadTask = uploadBytesResumable(storageRef, file);
        // these tasks aare dispatched so we listen to these events
        uploadTask.on(
            "state_changed", (snapshot) => {
                // cal percentage of upload
                const percent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                )
                // uploading to storage in firebase (normal storage)
                setStatus(StatusText.UPLOADING)
                setProgress(percent);
            }, (e) => {
                console.log("error uploading", e)
            }, async () => {
                setStatus(StatusText.UPLOADED)
                // uploaded a file to firebase storage and special download url to access the file
                // uploading a record or referece on firestore on client app
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                setStatus(StatusText.SAVING)

                await setDoc(doc(db, "users", user.id, 'files', fileIdToUploadTo), {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    downloadUrl: downloadUrl,
                    ref: uploadTask.snapshot.ref.fullPath,
                    createdAt: new Date(),
                })
                setStatus(StatusText.GENERATING)
                await generateEmbeddings(fileIdToUploadTo);
                setFileId(fileIdToUploadTo)

            }
        )
    }
    return {progress,status,fileId,handleUpload}
}

export default useUpload