"use client"
import React, { useEffect } from 'react'
// render the pdf
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from './ui/button'
import { useState } from 'react'
import {
    // LoaderIcon,
     ZoomIn, ZoomOut, RotateCw,
    LoaderCircle, ArrowLeft, ArrowRight, Download, Printer
} from "lucide-react"

// from a cross origin download request from firebase, there can be an error
// to directly get from firebase. so modify firebase cause rules

// We need to configure CORS
// gsutil cors set cors.json gs://<app-name>.appspot.com
// gsutil cors set cors.json gs://pdf-chat-f49f3.appspot.com
// go here >>> https://console.cloud.google.com/
// create new file in editor calls cors.json
// run >>> // gsutil cors set cors.json gs://pdf-chat-f49f3.appspot.com
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }: { url: string }) {

    // state responsible for buttons for docimnet
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [file, setFile] = useState<Blob | null>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);

    // const [response, setResponse] = useState({})

    useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(url);
            const file = await response.blob();
            setFile(file)
            
        }
        fetchFile()
    }, [url])
    const onDocLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages)
    }

    const handleClick = async (url: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "document.pdf"; // Customize the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handlePrint = (url: string) => {
        window.open(url, "_blank")
    }

    return (
        <div className='flex flex-col justify-center items-center'>
            {/* sticky bar for buttons for document */}
            <div className="sticky shadow-lg top-0 z-50 bg-gray-200 p-2 rounded-b-lg">
                <div className="max-w-6xl px-2 grid grid-cols-8 gap-2">
                    <Button
                        variant="outline"
                        disabled={pageNumber === 1}
                        onClick={() => {
                            if (pageNumber > 1) {
                                setPageNumber(pageNumber - 1);
                            }
                        }}
                    >
                        <ArrowLeft />
                    </Button>

                    <p className="flex items-center justify-center">
                        {pageNumber} of {numPages}
                    </p>

                    <Button
                        variant="outline"
                        disabled={pageNumber === numPages}
                        onClick={() => {
                            if (numPages) {
                                if (pageNumber < numPages) {
                                    setPageNumber(pageNumber + 1);
                                }
                            }
                        }}
                    >
                        <ArrowRight />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setRotation((rotation + 90) % 360)}
                    >
                        <RotateCw />
                    </Button>

                    <Button
                        variant="outline"
                        disabled={scale >= 1.5}
                        onClick={() => {
                            setScale(scale * 1.2);
                        }}
                    >
                        <ZoomIn />
                    </Button>

                    <Button
                        variant="outline"
                        disabled={scale <= 0.75}
                        onClick={() => setScale(scale / 1.2)}
                    >
                        <ZoomOut />
                    </Button>

                    <Button
                        variant="outline"
                        disabled={scale <= 0.75}
                        onClick={() => handleClick(url)}
                    >
                        <Download />
                    </Button>

                    <Button
                        variant="outline"
                        disabled={scale <= 0.75}
                        onClick={() => handlePrint(url)}
                    >
                        <Printer />
                    </Button>

                </div>
            </div>
            {!file ? (
                <LoaderCircle className='animate-spin h-20 w-20 text-indigo-600 mt-20' />
            ) : (
                <Document
                    loading={null}
                    file={file}
                    rotate={rotation}
                    onLoadSuccess={onDocLoadSuccess}
                    className="m-4 overflow-auto"
                >
                    <Page
                        className="shadow-lg"
                        scale={scale}
                        pageNumber={pageNumber}
                    />
                </Document>
            )
            }

        </div >
    )
}

export default PdfView