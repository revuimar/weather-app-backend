//const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


const db = require("../query/database");

passport.use(
    new LocalStrategy(
        {
            usernameField: "login",
            passwordField: "password",
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            //const user = await evaluateUser();
            var user = null;
            try{
                user = await db.getUser(username)
                //console.log("printing responce: " + await JSON.stringify(user))
                    /*.then(async (result) => {
                        user = await JSON.stringify(result)
                    })
                    .then(data => {console.log("data data from try  "+ data)
                    })
                    .catch(err => {console.log("promise rejection?", err)})*/

            }catch (e){
                return done(e);
            }

            console.log("Verification function called");
            console.log(user);
            if(user === null){
                console.log("User null");
                return done(null, false);
            }
            console.log("Commiting User");
            return done(null,
                {id: user.id, username: user.login}
                );
        }
    )
);

passport.serializeUser(function(user, done) {
    console.log("serialisation");
    done(null, user.id);
});

passport.deserializeUser( async function(id, done) {
    console.log("deserialoisation");
    try{
        let user = await db.getOneById(id)
        if (!user) {
            return done(new Error('user not found'));
        }
        done(null, user);
    }catch(e){
        done(e);
    }
});

module.exports = passport;
