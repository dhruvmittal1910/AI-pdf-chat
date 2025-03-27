"use client"
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

import { LoaderCircle } from 'lucide-react';
// render the pdf
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


export default function NewDoc({
    downloadUrl,
}: {
    id: string;
    name: string;
    size: number;
    downloadUrl: string;
}) {

    const [file, setFile] = useState<Blob | null>(null)

    React.useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(downloadUrl);
            const file = await response.blob();
            setFile(file)

        }
        fetchFile()
    }, [downloadUrl])
    return (
        <div className="relative w-50 h-80 rounded-xl bg-white drop-shadow-lg p-4 flex justify-center items-center overflow-hidden">
            {!file ? (
                <LoaderCircle className="animate-spin h-10 w-10 text-indigo-600" />
            ) : (
                <div className="w-full h-full overflow-hidden flex justify-center items-center">
                    <Document file={file} className="w-full h-full flex justify-center items-center">
                        <Page
                            pageNumber={1}
                            scale={0.3}
                            className="shadow-lg max-w-full max-h-full object-contain"
                        />
                    </Document>
                </div>
            )}
        </div>
    )
}

