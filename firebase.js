const { initializeApp } = require('firebase/app') ;

const firebaseConfig = {
    apiKey: "AIzaSyDJUvf1Z9FueGikC9YEXJA9ntr5_A-GJqs",
    authDomain: "style-mate-de6b7.firebaseapp.com",
    projectId: "style-mate-de6b7",
    storageBucket: "style-mate-de6b7.appspot.com",
    messagingSenderId: "742388892982",
    appId: "1:742388892982:web:6f680d1597f33b0cc09f97"
  };

const app = initializeApp(firebaseConfig);

module.exports = app;