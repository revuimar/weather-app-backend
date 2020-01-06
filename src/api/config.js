require('dotenv').config()
module.exports = {
    weatherApiKey: process.env.WEATHER_API_KEY,
    weatherDefaultCities: ["Lodz", "Wroclaw", "Szczecin", "Warsaw", "Rzeszow", "Krakow", "Gdansk", "Suwalki"],
    weatherDefaultCountry: "pl"
}