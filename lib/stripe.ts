// srver side
// creating a server side stripe instance
import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
    throw new Error("stripe api key not present")
}
const stripe = new Stripe(stripeSecretKey)

export default stripe