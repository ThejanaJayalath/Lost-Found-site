import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBtAtogDzDAnnGnSY7UKJWG-h3uK8nh-_Y",
    authDomain: "lost-and-found-4f091.firebaseapp.com",
    projectId: "lost-and-found-4f091",
    storageBucket: "lost-and-found-4f091.firebasestorage.app",
    messagingSenderId: "534758162304",
    appId: "1:534758162304:web:3d8e45ec8214c0eb35cb65"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
