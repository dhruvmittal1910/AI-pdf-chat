"use client"
import React from 'react'
import { Button } from "./ui/button"
import { PlusCircleIcon, FrownIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import useSubscription from '@/hooks/useSubscription';

function PlaceholderDocument() {
    const router = useRouter();

    const {hasActiveMembership, isOverFileLimit } = useSubscription();
    console.log("Debug 1",hasActiveMembership,isOverFileLimit)
    const handleClick = () => {
        // push user to add doc or upgrade page
        // check if user is free tier and if they have reached over
        // file limit if yes push to upgrade
        if (isOverFileLimit) {
            router.push("/dashboard/upgrade");
        } else {
            router.push("/dashboard/upload");
        }
    }
    return (
        <Button onClick={handleClick} className="flex flex-col items-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400">
            {isOverFileLimit ? (
                <FrownIcon className="h-16 w-16" />
            ) : (
                <PlusCircleIcon className="h-16 w-16" />
            )}

            <p className="font-semibold">
                {isOverFileLimit ? "Upgrade to add more documents" : "Add a document"}
            </p>
        </Button>
    )
}

export default PlaceholderDocument