"use client"

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

// number of documents limitation
const PRO_LIMIT = 20
const FREE_LIMIT = 2

function useSubscription() {
    const [hasActiveMembership, setHasActiveMembership] = useState(null)
    const [isOverFileLimit, setIsOverFileLimit] = useState(false)
    const { user } = useUser()

    // listen to user document
    // geetting from firestore database
    const [snapshot, loading, error] = useDocument(
        user && doc(db, "users", user.id),
        {
            snapshotListenOptions: { includeMetadataChanges: true }
        }
    )

    console.log("debug 2 ", snapshot?.data())

    // listen to user file collection
    // /from firestore database
    const [fileSnapshot, filesLoading] = useCollection(
        user && collection(db, "users", user?.id, "files")
    )

    // useeffect to active membership
    useEffect(() => {
        // no user doc
        if (!snapshot) return
        const data = snapshot.data();
        if (!data) return
        setHasActiveMembership(data.hasActiveMembership)


    }, [snapshot])


    console.log("debug 3 ", fileSnapshot?.docs.length)

    // if over filelimit for userfiles
    useEffect(() => {
        if (!fileSnapshot || hasActiveMembership === null) return
        const files = fileSnapshot?.docs
        const usersLimit = hasActiveMembership ? PRO_LIMIT : FREE_LIMIT

        console.log("Checking if user is over file limit", files.length, usersLimit)

        setIsOverFileLimit(files.length >= usersLimit)

    }, [fileSnapshot, hasActiveMembership, PRO_LIMIT, FREE_LIMIT])

    return { hasActiveMembership, loading, error, isOverFileLimit, filesLoading }
}

export default useSubscription