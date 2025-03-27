// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getApp, getApps, initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD5SJ_o5MmygwlDFDLRrYFCP-CxF30U6es",
    authDomain: "pdf-chat-f49f3.firebaseapp.com",
    projectId: "pdf-chat-f49f3",
    storageBucket: "pdf-chat-f49f3.firebasestorage.app",
    messagingSenderId: "492290498282",
    appId: "1:492290498282:web:d7174b9a6b68265d418193",
    measurementId: "G-TZKWYXJ5QK"
};

const app=getApps().length===0?initializeApp(firebaseConfig):getApp();

// connect to firestore db
const db=getFirestore(app);

// nosql build
const storage=getStorage(app);

export {db,storage}
