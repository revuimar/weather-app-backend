const { pool } = require('./config');
const config = require('./config');
const config_api = require('../api/config')
const uuidv4 = require('uuid/v4');
const api = require('../api/weatherapi')

function updateData() {
    return new Promise(async(resolve, reject) => {
        const result = await elementExists(api.parseTimestamp(new Date().getTime()))
        if(result.status === true){
            return reject({error: "Data is up to date"})
        }
        else if(result.status === undefined){
            return reject({error: "DB error"})
        }
        let newData = null
        await api.bulkDefaultWeatherUpdate()
            .then(res => {
                if(res.error !== undefined){
                    return reject(res);
                }
                newData = res
            })
            .catch(async err =>{
                return reject({error: err})
            });
        const client = await pool.connect()
        await client.query('BEGIN');
        for(let item in newData){
            console.log("new data"+await JSON.stringify(newData[item]))
            await client
                .query('INSERT INTO stats(data) VALUES ($1)',[newData[item]])
                .catch((err) => {
                    return reject({error: err});
                });
            await client.query('COMMIT');
        }
        client.release();
        return resolve({status: "success"});
    });
}
function elementExists(timestamp){
    const sql = `SELECT data 
                 FROM stats 
                 WHERE (data->>'timestamp') = ($1)`;

    return new Promise((resolve, reject) => {
        pool
            .query(sql,[timestamp])
            .then((res) => {
                if(res.rows.length){
                    return resolve({status: true})
                }
                else{
                    return resolve({status: false});
                }
            })
            .catch((err) => {
                reject(err);
            });

});
}
function getCollectionSize() {
    const sql = `SELECT COUNT(DISTINCT data->'timestamp') AS unique_collections FROM stats`;
    return new Promise((resolve, reject) => {
        pool
            .query(sql)
            .then((res) => {
                console.log(res.rows[0]);
                resolve(res.rows[0]);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function getCityAverageWeather(city, days,property){
    const sql = `SELECT data 
                 FROM stats 
                 WHERE (data->>'city') = ($1)
                 ORDER BY stats.id DESC LIMIT ($2)`;
    const variables = [city,days];

    console.log(city,days);

    return new Promise((resolve, reject) => {
        pool
            .query(sql,variables)
            .then((res) => {
                const collection = [];
                if(!res.rows.length){
                    reject({error: "no record found"});
                }
                collection.push(res.rows[0].data);
                console.log("lolol",collection);
                if(!("precipitation" in collection[0])){
                    collection[0]["precipitation"] = 0;
                }
                if(!("wind_direction" in collection[0])){
                    collection[0]["wind_direction"] = 0;
                }
                if (days != 1) {
                    for (var i = 1; i < res.rows.length; i++) {
                        for (var key in res.rows[i].data) {
                            if (key.toString() === "timestamp" || key.toString() === "city") {
                                continue;
                            }
                            if(res.rows[i].data[key] === undefined || res.rows[i].data[key] === null){
                                continue;
                            }
                            collection[0][key] += res.rows[i].data[key];
                        }
                    }
                    console.log(collection)
                    for (var key in collection[0]) {
                        if (key.toString() === "timestamp" || key.toString() === "city") {
                            continue;
                        }
                        collection[0][key] = collection[0][key] / days;
                        collection[0][key] = parseFloat(collection[0][key].toFixed(2))
                    }
                }
                if(property === undefined){
                    resolve({value: collection[0]});
                }
                else{
                    resolve({value: collection[0][property]});
                }

            })
            .catch((err) => {
                reject({error: "error parsing request"});
            });
    });
}
async function getPolandAverage(days,property) {
    const data = [];
    const cities = config_api.weatherDefaultCities;
    return new Promise( async (resolve, reject) => {
        if(days===undefined){
            console.log("no days given")
            return reject({error: "no days given"})
        }
        for (let city of cities) {
            await getCityAverageWeather(city, days)
                .then(async(result) => {
                    console.log("look at me! "+  await JSON.stringify(result.value))
                    data.push(result.value);
                })
                .catch((err => {
                        console.log("rejecting corrupted request")
                        return reject(err)
                    }
                ))
        }
        await data;

        var collection =
            {
                country: 'Poland',
                humidity: 0,
                pressure: 0,
                wind_speed: 0,
                temperature: 0,
                precipitation: 0,
                wind_direction: 0
            };

        for (var i = 0; i < data.length; i++) {
            for (var key in data[i]) {
                if (key.toString() === "timestamp" || key.toString() === "city") {
                    continue;
                }
                collection[key] += data[i][key] / data.length;
            }
        }
        console.log(collection)
        if(property === undefined)
            resolve({value: collection});
        else
            resolve({value:collection[property]});

    })
}

async function addUser(login,email,password) {
    const client = await pool.connect()
    await client.query('BEGIN')
    await JSON.stringify(client.query(`SELECT id FROM users WHERE email = $1`, [email], function(err, result) {
        return new Promise((resolve, reject) => {
            if(result.rows[0]){
                console.log("join redir user exist",result.rows);
                //req.flash(‘warning’, “This email address is already registered. <a href=’/login’>Log in!</a>”);
                    resolve("join")
                //res.redirect('/join');
            }
            else{
                console.log("Creating users");
            client.query(`INSERT INTO users (id, login, email, password) VALUES ($1, $2, $3, $4)`,
                [uuidv4(), login, email, password], function(err, result) {
                    if(err){
                        console.log(err);
                        reject("error")
                    }
                    else {
                        client.query('COMMIT');
                        console.log(result);
                        //req.flash(‘success’,’User created.’)
                        resolve("login");
                        //res.redirect('/login');

                    }
                });
                }
            })
    }));
    client.release();
}
async function getUser(login) {
    const client = await pool.connect()
    await client.query('BEGIN');
    console.log("getting user");

    return new Promise((resolve, reject) => {
        client.query(`SELECT id, login, email, password FROM users WHERE email=$1`, [login])
            .then((res)=>{
                console.log("got data",res.rows[0])
                client.release();

                if (!res.rows.length) {
                    console.log("About to reject")
                    //req.flash(‘danger’, “Oops. Incorrect login details.”);
                    reject(res.rows);
                }
                else{
                    console.log("Confirm")
                    resolve(res.rows[0]);
                }
            })
    })
}
async function getOneById(id) {
    const client = await pool.connect()
    await client.query('BEGIN');
    console.log("getting user by id: "+ id);

    return new Promise((resolve, reject) => {
        try {
            client.query(`SELECT id, login, email, password FROM users WHERE id=$1`, [id])
                .then((res) => {
                    console.log("got user data", res.rows[0])
                    client.release();
                    if (!res.rows.length) {
                        console.log("About to reject")
                        reject(res.rows);
                    }
                    else {
                        console.log("Confirm user by id")
                        resolve(res.rows[0]);
                    }
                })
                .catch((e) => reject("auth error"))
        }catch (e){
            reject("auth error")
        }
    })
}

module.exports = { updateData, getCityAverageWeather,getCollectionSize,getPolandAverage,addUser,getUser,getOneById};