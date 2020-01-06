const db = require('../query/database')
const express = require("express");
const router = express.Router();
const api = require('../api/weatherapi')
//db queries

async function auth(request_auth,apiKey) {
    if(!request_auth){
        try {
            let user = await db.getOneById(apiKey)
            if (!user) {
                return new Error('user not found');
            }
        }catch (e){
            return new Error('api key not verified')
        }
    }
}

router.post('/api/average', async function(req, res) {

    let city = req.query.c;
    let days = req.query.d;
    let property = req.query.p;
    let apiKey = req.query.k;

    const value = await auth(req.isAuthenticated(),apiKey);
    if(value){
        const error = {error: "request not authenticated"}
        return res.json(error);
    }
    let response = null
    await db.getCityAverageWeather(city,days,property)
        .then(res => {
            response = res
        })
        .catch(err => {
            response = err
        });

    return res.json(response);
});
router.post('/api/poland',async function (req,res) {
    let days = req.query.d;
    let property = req.query.p;
    let apiKey = req.query.k;

    const value = await auth(req.isAuthenticated(),apiKey);
    if(value){
        const error = {error: "request not authenticated"}
        return res.json(error);
    }
    let response = null;
    await db.getPolandAverage(days,property)
        .then(res => {
            console.log("response" + res);
            response = res;
        })
        .catch(err => {
            console.log("error" + err)
            response = err;
        });

    return res.json(response);
});
router.post('/api/dbsize',async function(req,res) {
    let apiKey = req.query.k;

    var value = await auth(req.isAuthenticated(),apiKey)
    if(value){
        const error = {error: "request not authenticated"}
        return res.json(error);
    }
    else {
        return db.getCollectionSize()
            .then(unique_collections => {
                res.json(unique_collections)
            })
    }
});

router.post('/api/update', async function (req,res) {
    let apiKey = req.query.k;
    const value = await auth(req.isAuthenticated(),apiKey)
    if(value){
        const error = {error: "request not authenticated"}
        return res.json(error);
    }
    else{
        let result = null
        await db.updateData()
            .then(res=>{
                result = res;
            })
            .catch(err=>{
                result = err;
            });
        console.log(result);
        return res.json(result);
    }

});

module.exports = router;