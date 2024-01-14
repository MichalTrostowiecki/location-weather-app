

let cityHistory = [];

$(function() {
    // Getting data from local storage
    let searchHistory = localStorage.getItem("searchHistory");

    
    if (searchHistory) {
        searchHistory = JSON.parse(searchHistory);

        searchHistory.forEach(function(element) {
            let historyBtn = $("<button>").text(element);
            $("#history").append(historyBtn);
        })
    } else {
        localStorage.setItem("searchHistory", JSON.stringify(cityHistory));
    }

    
})

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
    
    $(".forecast-title").addClass("hidden");

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
            
            // Convert time stamp to current date after
            let unixTimeStamp = data.list[0].dt
            let date = dayjs.unix(unixTimeStamp).format("DD-MM-YYYY");

            // Get the weather icon to display
            let weatherIcon = data.list[0].weather[0].icon
            let iconSrc = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`

            // Create html elements with data from API
            let todayTitle = $("<div>").addClass("today-title");
            let icon = $("<img>").attr("src", iconSrc);
            cityName = $("<h2>").text(data.city.name + " " + date);
            let temp = data.list[0].main.temp;
            temperature = $("<p>").text("Temp: " + temp.toFixed(1) + " °C");
            let wind = $("<p>").text("Wind: " + data.list[0].wind.speed + " KPH")
            let humidity = $("<p>").text("Humidity: " + data.list[0].main.humidity + "%")
            
            
            // Append all html elements to div displaying today's weather
            todayTitle.append(cityName, icon)
            $("#today").append(todayTitle, temperature, wind, humidity);
            
            display5Days(data.list);
            $(".forecast-title").removeClass("hidden");
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

    // Small check to
    if (searchInput === "" || searchInput === " ") {
        alert("Please type in City to check the weather. Empty Space is not allowed")
        return
    } else {
        //Clear today's weather and forecast
        $("#today").empty();
        $("#forecast").empty();
        getWeather(searchInput)
    }

    // Generate buttons with user searches
    let historyBtn = $("<button>").text(searchInput);
    $("#history").prepend(historyBtn);


    // Creating a search history to later save to local storage
    
    cityHistory.unshift(searchInput);
    let localStData = JSON.parse(localStorage.getItem("searchHistory"));
    localStData.unshift(searchInput)
    localStorage.setItem("searchHistory", JSON.stringify(localStData));
    
   

})

// Function to display 5 days forecast
function display5Days(data) {

    
    let currentDate = dayjs().format("DD-MM-YYYY");

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
    // Remove from 5 days forecast today's forecast
    delete groupedData[currentDate];

    // Looping through dates
    Object.keys(groupedData).forEach(function(date) {
        let items = groupedData[date];
        

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
        // Get most frequent icon for the weather to display
        let weatherIcon = findMostFrequentIcon(iconCode);

        // Assigning average temp, wind, humidity for a day
        let avgTemp = (totalTemp / items.length).toFixed(1);
        let avgWind = (totalWind / items.length).toFixed(1);
        let avgHumidity = (totalHumidity / items.length).toFixed(0);

        // Manipulating DOM to display weather
        let dayDate = $("<h5>").text(date);
        let icon = $("<img>").attr("src", `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`)
        let dayTemp = $("<p>").text("Temp: " + avgTemp + " °C");
        let daywind = $("<p>").text("Wind: " + avgWind + " KPH");
        let dayHumidity = $("<p>").text("Humidity: " + avgHumidity + "%");

        let dayContainer = $("<div>").addClass("dayCard");
        dayContainer.append(dayDate, icon, dayTemp, daywind, dayHumidity);

        $("#forecast").append(dayContainer);
        
        
        
    })

   

}

// Function to find the most frequent icon in "iconCode" array for a day
function findMostFrequentIcon(array) {

    let getMostFrequent = function(arr) {
        
        // Variables to store items and it's frequency
        let frequency = {};
        let maxFrequency = 0;
        let mostFrequentIcon = null;
        
        // Loop through to find out frequency of each item
        for (let i = 0; i < arr.length; i++ ) {
            let item = arr[i];
            frequency[item] = (frequency[item] || 0) + 1;
            
            if (frequency[item] > maxFrequency) {
                maxFrequency = frequency[item];
                mostFrequentIcon = item;
            }
        }
        return mostFrequentIcon;
        
    };

    //In API icons code for day is eg. "03d", "04d"
    let dayIcons = array.filter(function(icon) {
        return icon.endsWith('d');
    });

    let mostFrequentDayIcon = getMostFrequent(dayIcons);

    // If no weather icons for day use the one for night which end with eg. "03n"
    if (!mostFrequentDayIcon && array.length > 0) {
        mostFrequentDayIcon = getMostFrequent(array);
    }

    return mostFrequentDayIcon;
}

// Function to display weather when User click button from search history
$("#history").on("click", "button", function() {

    
    let cityBtn = $(this).text();
    
    // Clear existing weather on a screen
    $("#today").empty();
    $("#forecast").empty();

    // Make an API call when button is clicked with the coresponding name of a city
    getWeather(cityBtn);


} )