// javascropt helper library running on client side

import { loadStripe, Stripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}

const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        // ḷoead stripe
        stripePromise = loadStripe(stripeKey);
    }
    return stripePromise
}

export default getStripe;