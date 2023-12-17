const express = require('express');
const firebaseApp = require('./../firebase');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = require("firebase/auth");

const login = (req, res) => {

    const auth = getAuth();
    signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
        res.status(200);
        res.json({
            'success': true,
            'data': user,
            'errors': null
        });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(200);
        res.json({
            'success': false,
            'errors': errorMessage,
        });
    });


}

const register = (req, res) => {

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then(async (userCredential) => {
        // Signed up 
        const user = userCredential.user;


        await updateProfile(user, {
            displayName: req.body.name,
        });
        // ...
        res.status(201);
        res.json({
            'success': true,
            'data':user,
            'errors': null,
        });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        res.status(400);
        res.json({
            'success': false,
            'errors': errorMessage,
        });
    });

}

module.exports = {
    login,
    register
}