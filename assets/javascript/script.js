
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
    })
    .catch(function(error) {
        console.error("Error fetching cordinates:", error)
    })

};


// Get weather based on cordinates provided
function getWeather(city) {
    
    convertCity(city, function(cityCordinates) {
        
        let APIkey = "bfad5b4e337fb545db6e1e7cf22420c3"
        let lat = cityCordinates.latitude;
        let lon = cityCordinates.longitude;
        url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${APIkey}`
    
        fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data)
            
            // Convert time stamp to current date after
            let unixTimeStamp = data.list[0].dt
            let date = dayjs.unix(unixTimeStamp).format("DD-MM-YYYY");

            // Create html elements with data from API
            cityName = $("<h2>").text(data.city.name + " " + date);
            let temp = data.list[0].main.temp;
            temperature = $("<p>").text("Temp: " + temp.toFixed(1) + " °C");
            let wind = $("<p>").text("Wind: " + data.list[0].wind.speed + " KPH")
            let humidity = $("<p>").text("Humidity: " + data.list[0].main.humidity + "%")


            // Append all html elements to div displaying today's weather
            $("#today").append(cityName, temperature, wind, humidity);
            
            display5Days(data.list);
        })
        .catch(function(error) {
            console.error("Error fetching weather data:", error)
        })
        
    })
}

// Add event listener to a search button to listen for a click
$("#search-button").on("click", function(event) {
    
    event.preventDefault();

    // Get value from user input - city name
    let searchInput = $("#search-input").val()
    getWeather(searchInput)

})


function display5Days(data) {
    let groupedData = {};

    // For each date, add all available data
    data.forEach(function(item) {

        // Transform unix code from received data to string date
        let date = dayjs.unix(item.dt).format("DD-MM-YYYY");

        // if date does not exist assign new key with a date and set value to item
        if(!groupedData[date]) {
            groupedData[date] = [item];
        // if date already exist add item to that specific date
        } else {
            groupedData[date].push(item);
        }


    });

    Object.keys(groupedData).forEach(function(date) {
        let items = groupedData[date];
        console.log(items)

        let totalTemp = 0;
        let totalWind = 0;
        let totalHumidity = 0;

        // Variable to store the codes for the weather icons, to see which one occurs the most often
        let iconCode = [];
        
        // Looping through each item to get sum up all data
        for (let i = 0; i < items.length; i++) {
            totalTemp += items[i].main.temp;
            totalWind += items[i].wind.speed;
            totalHumidity += items[i].main.humidity;
            iconCode.push(items[i].weather[0].icon);
        }

        // Assigning average temp, wind, humidity for a day
        let avgTemp = (totalTemp / items.length).toFixed(1);
        let avgWind = (totalWind / items.length).toFixed(1);
        let avgHumidity = (totalHumidity / items.length).toFixed(0);

        // Manipulating DOM to display weather
        let dayDate = $("<h3>").text(date);
        let icon;
        let dayTemp = $("<p>").text("Temp: " + avgTemp + " °C");
        let daywind = $("<p>").text("Wind: " + avgWind + " KPH");
        let dayHumidity = $("<p>").text("Humidity: " + avgHumidity + "%");

        let dayContainer = $("<div>");
        dayContainer.append(dayDate, icon, dayTemp, daywind, dayHumidity);

        $("#forecast").append(dayContainer);
        
        let weatherIcon = findMostFrequentIcon(iconCode);
        console.log(weatherIcon);
    })

}

// Function to find the most frequent icon in "iconCode" array
function findMostFrequentIcon(array) {

    // Variables to store items and it's frequency
    let frequency = {};
    let maxFrequency = 0;
    let mostFrequentIcon = null;


    // Loop through to find out frequency of each item
    for (let i = 0; i < array.length; i++) {
        let item = array[i];

        if (frequency[item]) {
            frequency[item]++;
        } else {
            frequency[item] = 1;
        }

        // Check if the current item is the most frequent one so far
        if (frequency[item] > maxFrequency) {
            maxFrequency = frequency[item];
            mostFrequentIcon = item
        }
        
    }

    return mostFrequentIcon;
}
