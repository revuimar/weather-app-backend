const weather = require("openweather-apis");
const config = require("./config");

weather.setUnits("metric");
weather.setAPPID(config.weatherApiKey);

function translateReport(city, timestamp,report) {
    const
        {main:{temp: temperature, humidity, pressure},
        wind: {speed: wind_speed, deg: wind_direction},
        rain: {"3h": precipitation} = {"3h": 0}} = report;
    return {timestamp, temperature, pressure, humidity, precipitation, wind_speed, wind_direction, city}
}
function cutTimestamp(timestamp) {
    const factor = 1000 * 60 * 60 * 12;
    return Math.floor(timestamp / factor) * factor
}

async function bulkDefaultWeatherUpdate(){
    const currentTime = cutTimestamp(new Date().getTime());
    const result = await config.weatherDefaultCities.reduce(async (reportsPromise, city) => {
        const allReports = await reportsPromise;
        weather.setCity(city);
        let report = await new Promise((resolve, reject) => {
            weather.getAllWeather((err, res) => {
                if (err){
                    reject(err)
                }
                resolve(res);
            });
        }).catch(err => report = {error: err});
        if(report.error !== undefined){return(report)}
        console.log("current report" + await JSON.stringify(report));
        const parsedReport = translateReport(city,currentTime,report);
        allReports.push(parsedReport);
        return allReports;
    }, [])
        .catch(err => {
            return{error: err}
        });
    return result;
}

module.exports = {bulkDefaultWeatherUpdate,parseTimestamp: cutTimestamp}