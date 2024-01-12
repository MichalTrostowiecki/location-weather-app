
// Convert city name into a cordinates needed for API call for 5 days weather forecast
function convertCity(cityName, callback) {

    let APIkey = "bfad5b4e337fb545db6e1e7cf22420c3"
    url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIkey}`;

    fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        let cityCordinates = {
            latitude: data[0].lat,
            longitude: data[0].lon
        };
        callback(cityCordinates);
    });
};


// Get weather based on cordinates provided
function getWeather() {
    convertCity("London", function(cityCordinates) {
        
        let lat = cityCordinates.latitude;
        let lon = cityCordinates.longitude;
        url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=bfad5b4e337fb545db6e1e7cf22420c3`
    
        fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data)
        })
    })
}

getWeather();
