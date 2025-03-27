import { getApp, getApps, initializeApp, App, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

var admin = require("firebase-admin");

var serviceKey = require("@/pdf-chat-f49f3-firebase-adminsdk-fbsvc-ba13b37b87.json");

let app:App;

if(getApps().length===0){
    app=initializeApp({
        credential:cert(serviceKey),
    })
}else{
    app=getApp();
}

const adminDb=getFirestore(app);
const adminStorage=getStorage(app)

export {adminStorage,adminDb, app as adminApp}
