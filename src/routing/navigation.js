const express = require("express");
//const passport = require("./passport")
const passport = require("./passport");
const db = require("../query/database");
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/login', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/account');
    }
    else{
        console.log("perform get");
        res.render('login',{
            locals: {status: req.user},
            partials: {partial: '/partial/menu'}
        })//, {title: "Log in", userData: req.user});
    }

});

router.post('/login',
    passport.authenticate('local', { successRedirect: '/account',failureRedirect: '/login'}));



router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});

router.get('/account', function (req, res, next) {
    //console.log(req.session.passport.user);
    console.log("before auth ",req.user)
    if(req.isAuthenticated()){
        res.render('account', {
            title: 'Account',
            locals: {status: req.user},
            partials: {partial: '/partial/menu'}

        })//, {title: 'Account', userData: req.user, userData: req.user });
    }
    else{
        console.log("unauthenticated")
        res.redirect('/login');
    }
});

router.get('/join', function (req, res, next) {
    res.render('join',{
        locals: {status: req.user},
        partials: {partial: '/partial/menu'}
    })
});
router.post('/join', async function (req, res) {
    try{
        //Console.log("Start join");
        var password = await bcrypt.hash(req.body.password, 5);
        return db.addUser(req.body.login,req.body.email,password)
            .then(message => {
                res.json(message)
                console.log(message);
            })

    }
    catch(e){throw(e)}
});

router.get('/home', function (req, res) {
    res.render('home',{
        locals: {status: req.user},
        partials: {partial: '/partial/menu'}
    })
})

module.exports = router;