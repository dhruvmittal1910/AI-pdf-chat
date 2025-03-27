"use server"

import { UserDetails } from '@/app/dashboard/upgrade/page'
import React from 'react'
import { auth } from "@clerk/nextjs/server"
import { adminDb } from '@/firebaseAdmin'
import { SubscriptIcon, Users } from 'lucide-react'
import stripe from '@/lib/stripe'
import getBaseUrl from '@/lib/getBaseUrl'

export async function createCheckoutSession(userDetails: UserDetails) {
    const { userId } = await auth()

    if (!userId) throw new Error("no user")

    // get user details from firebase firestore
    const user = await adminDb
        .collection("users")
        .doc(userId)
        .get()

    let stripeCustomerId
    // if coming back
    stripeCustomerId = user.data()?.stripeCustomerId

    // if coming for first time
    if (!stripeCustomerId) {
        // create one customer stripe
        const customer = await stripe.customers.create({
            email: userDetails.email,
            name: userDetails.name,
            metadata: {
                userId
            }
        })

        // store customer in db
        await adminDb.collection("users").doc(userId).set({
            stripeCustomerId: customer.id
        })

        stripeCustomerId = customer.id
    }

    // stripe checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        line_items:[
            {
                price:"price_1QtM19IRVi8gEaYNYGxZp9e9",
                quantity:1
            }
        ],
        mode:"subscription",
        customer:stripeCustomerId,
        success_url:`${getBaseUrl()}/dashboard?upgrade=true`,
        cancel_url:`${getBaseUrl()}/dashboard/upgrade`
    })

    return session.id
}
