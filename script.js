/* =========================================================
   OPENWEATHER API
========================================================= */

const API_KEY =
  "a942da68890823cb7d2e541b09335639";


const GEO_API =
  "https://api.openweathermap.org/geo/1.0/direct";


const WEATHER_API =
  "https://api.openweathermap.org/data/2.5/weather";


const FORECAST_API =
  "https://api.openweathermap.org/data/2.5/forecast";



/* =========================================================
   ELEMENTS
========================================================= */

const searchInput =
  document.querySelector("#searchInput");


const searchBtn =
  document.querySelector("#searchBtn");


const suggestions =
  document.querySelector("#suggestions");


const dailyForecast =
  document.querySelector("#dailyForecast");


const locationName =
  document.querySelector("#locationName");


const localTime =
  document.querySelector("#localTime");


const temperature =
  document.querySelector("#temperature");


const condition =
  document.querySelector("#condition");


const weatherIcon =
  document.querySelector("#weatherIcon");


const feelsLike =
  document.querySelector("#feelsLike");


const wind =
  document.querySelector("#wind");


const humidity =
  document.querySelector("#humidity");


const visibility =
  document.querySelector("#visibility");


const pressure =
  document.querySelector("#pressure");


const dewPoint =
  document.querySelector("#dewPoint");


const hourlyForecast =
  document.querySelector("#hourlyForecast");


const locationChip =
  document.querySelector("#locationChip");


const coordinates =
  document.querySelector("#coordinates");


const updatedTime =
  document.querySelector("#updatedTime");


const weatherImage =
  document.querySelector("#weatherImage");


const message =
  document.querySelector("#message");



/* =========================================================
   VARIABLES
========================================================= */

let timezoneOffset =
  0;


let temperatureChartInstance =
  null;


let searchTimer;



/* =========================================================
   FETCH JSON
========================================================= */

async function getJSON(url) {

  const response =
    await fetch(url);


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "API Error"
    );

  }


  return data;

}



/* =========================================================
   SEARCH CITY
========================================================= */

async function searchCity() {

  const query =
    searchInput
      .value
      .trim();


  if (!query) {

    showMessage(
      "Vui lòng nhập địa điểm."
    );

    return;

  }


  try {

    const url =

      `${GEO_API}
?q=${encodeURIComponent(query)}
&limit=5
&appid=${API_KEY}`

        .replaceAll(
          "\n",
          ""
        );


    const places =
      await getJSON(url);


    if (
      places.length === 0
    ) {

      showMessage(
        "Không tìm thấy địa điểm."
      );

      return;

    }


    const place =
      places[0];


    searchInput.value =

      `${place.name}, ${place.country}`;


    suggestions.innerHTML =
      "";


    await loadWeather(

      place.lat,

      place.lon

    );

  }

  catch(error) {

    console.error(
      error
    );


    showMessage(
      "Không thể tìm địa điểm."
    );

  }

}



/* =========================================================
   AUTOCOMPLETE
========================================================= */

searchInput.addEventListener(

  "input",

  () => {

    clearTimeout(
      searchTimer
    );


    searchTimer =
      setTimeout(

        async () => {

          const query =
            searchInput
              .value
              .trim();


          if (
            query.length < 2
          ) {

            suggestions.innerHTML =
              "";

            return;

          }


          try {

            const url =

              `${GEO_API}
?q=${encodeURIComponent(query)}
&limit=5
&appid=${API_KEY}`

                .replaceAll(
                  "\n",
                  ""
                );


            const results =
              await getJSON(url);


            showSuggestions(
              results
            );

          }

          catch(error) {

            console.error(
              error
            );

          }

        },

        300

      );

  }

);



/* =========================================================
   SHOW SUGGESTIONS
========================================================= */

function showSuggestions(
  results
) {

  suggestions.innerHTML =
    "";


  results.forEach(

    place => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "suggestion-item";


      item.innerHTML = `

        <strong>

          ${place.name}

          ${
            place.state
              ?
              ", " + place.state
              :
              ""
          }

        </strong>

        <span>

          ${place.country}

        </span>

      `;


      item.addEventListener(

        "click",

        async () => {

          searchInput.value =

            `${place.name}, ${place.country}`;


          suggestions.innerHTML =
            "";


          await loadWeather(

            place.lat,

            place.lon

          );

        }

      );


      suggestions.appendChild(
        item
      );

    }

  );

}



/* =========================================================
   LOAD WEATHER
========================================================= */

async function loadWeather(
  lat,
  lon
) {

  try {

    const currentURL =

      `${WEATHER_API}
?lat=${lat}
&lon=${lon}
&units=metric
&lang=vi
&appid=${API_KEY}`

        .replaceAll(
          "\n",
          ""
        );


    const forecastURL =

      `${FORECAST_API}
?lat=${lat}
&lon=${lon}
&units=metric
&lang=vi
&appid=${API_KEY}`

        .replaceAll(
          "\n",
          ""
        );


    const [

      current,

      forecast

    ] =

      await Promise.all([

        getJSON(
          currentURL
        ),

        getJSON(
          forecastURL
        )

      ]);


    timezoneOffset =
      current.timezone || 0;


    updateCurrentWeather(
      current
    );


    updateHourlyForecast(
      forecast.list
    );


    updateDailyForecast(
      forecast.list
    );


    updateTemperatureChart(
      forecast.list
    );


    updateBackground(
      current.weather[0].main
    );


    coordinates.textContent =

      `${current.coord.lat.toFixed(4)}, ${current.coord.lon.toFixed(4)}`;


    updatedTime.textContent =

      formatDateTime(
        current.dt
      );


    searchInput.value =

      `${current.name}, ${current.sys.country}`;

  }

  catch(error) {

    console.error(
      error
    );


    showMessage(
      "Không tải được dữ liệu thời tiết. Kiểm tra API key."
    );

  }

}



/* =========================================================
   CURRENT WEATHER
========================================================= */

function updateCurrentWeather(
  data
) {

  const weather =
    data.weather[0];


  locationName.textContent =

    `${data.name}, ${data.sys.country}`;


  locationChip.textContent =

    `${data.name}, ${data.sys.country}`;


  temperature.textContent =

    `${Math.round(
      data.main.temp
    )}°`;


  condition.textContent =

    capitalize(
      weather.description
    );


  feelsLike.textContent =

    `Feels like ${Math.round(
      data.main.feels_like
    )}°`;


  weatherIcon.src =

    `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;


  wind.textContent =

    `${data.wind.speed} m/s`;


  humidity.textContent =

    `${data.main.humidity}%`;


  visibility.textContent =

    `${(
      data.visibility /
      1000
    ).toFixed(1)} km`;


  pressure.textContent =

    `${data.main.pressure} hPa`;


  localTime.textContent =

    formatTime(
      data.dt
    );


  const dewPointValue =

    calculateDewPoint(

      data.main.temp,

      data.main.humidity

    );


  dewPoint.textContent =

    `${Math.round(
      dewPointValue
    )}°C`;


  updateCardImage(
    weather.main
  );

}



/* =========================================================
   HOURLY FORECAST
========================================================= */

function updateHourlyForecast(
  list
) {

  hourlyForecast.innerHTML =
    "";


  const hourlyData =
    list.slice(
      0,
      9
    );


  hourlyData.forEach(

    item => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "hour-card";


      card.innerHTML = `

        <time>

          ${formatHour(item.dt)}

        </time>


        <img

          src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png"

          alt=""

        >


        <span class="rain">

          ${Math.round(
            (item.pop || 0) *
            100
          )}%

        </span>


        <strong class="temp">

          ${Math.round(
            item.main.temp
          )}°

        </strong>

      `;


      hourlyForecast.appendChild(
        card
      );

    }

  );

}



/* =========================================================
   DAILY FORECAST
========================================================= */

function updateDailyForecast(
  list
) {

  const days =
    {};


  list.forEach(

    item => {

      const date =
        new Date(

          (
            item.dt +
            timezoneOffset
          )

          *

          1000

        );


      const key =

        `${date.getUTCFullYear()}-

${String(
  date.getUTCMonth() + 1
).padStart(2, "0")}-

${String(
  date.getUTCDate()
).padStart(2, "0")}`

          .replaceAll(
            "\n",
            ""
          );


      if (
        !days[key]
      ) {

        days[key] =
          [];

      }


      days[key].push(
        item
      );

    }

  );


  const groups =

    Object
      .values(
        days
      )
      .slice(
        0,
        6
      );


  dailyForecast.innerHTML =
    "";


  groups.forEach(

    (
      dayItems,
      index
    ) => {

      const maxTemp =

        Math.max(

          ...dayItems.map(

            item =>
              item.main.temp_max

          )

        );


      const minTemp =

        Math.min(

          ...dayItems.map(

            item =>
              item.main.temp_min

          )

        );


      const middleItem =

        dayItems[

          Math.floor(
            dayItems.length /
            2
          )

        ];


      const card =
        document.createElement(
          "div"
        );


      card.className =

        index === 0

          ?

          "daily-card today"

          :

          "daily-card";


      const dayName =

        index === 0

          ?

          "Today"

          :

          formatWeekday(
            middleItem.dt
          );


      card.innerHTML = `

        <div>

          <strong>

            ${dayName}

          </strong>


          <span>

            ${Math.round(maxTemp)}°

            /

            ${Math.round(minTemp)}°

          </span>

        </div>


        <img

          src="https://openweathermap.org/img/wn/${middleItem.weather[0].icon}.png"

          alt=""

        >

      `;


      dailyForecast.appendChild(
        card
      );

    }

  );

}



/* =========================================================
   TEMPERATURE CHART
========================================================= */

function updateTemperatureChart(
  list
) {

  const data =
    list.slice(
      0,
      9
    );


  const labels =

    data.map(

      item =>
        formatHour(
          item.dt
        )

    );


  const temperatures =

    data.map(

      item =>
        Math.round(
          item.main.temp
        )

    );


  if (
    temperatureChartInstance
  ) {

    temperatureChartInstance.destroy();

  }


  const canvas =

    document.querySelector(
      "#temperatureChart"
    );


  temperatureChartInstance =

    new Chart(

      canvas,

      {

        type:
          "line",


        data: {

          labels:
            labels,


          datasets: [

            {

              data:
                temperatures,

              borderColor:
                "#ff5a1f",

              borderWidth:
                2.5,

              tension:
                0.4,

              pointRadius:
                0,

              pointHoverRadius:
                5

            }

          ]

        },


        options: {

          responsive:
            true,


          maintainAspectRatio:
            false,


          plugins: {

            legend: {

              display:
                false

            }

          },


          scales: {

            x: {

              display:
                false

            },


            y: {

              display:
                false

            }

          }

        }

      }

    );

}



/* =========================================================
   DEW POINT
========================================================= */

function calculateDewPoint(
  temperature,
  humidity
) {

  const a =
    17.62;


  const b =
    243.12;


  const gamma =

    Math.log(

      humidity /
      100

    )

    +

    (

      a *
      temperature

    )

    /

    (

      b +
      temperature

    );


  return (

    b *
    gamma

  )

  /

  (

    a -
    gamma

  );

}



/* =========================================================
   TIME
========================================================= */

function formatTime(
  unix
) {

  const date =

    new Date(

      (
        unix +
        timezoneOffset
      )

      *

      1000

    );


  return date
    .toLocaleTimeString(

      "en-US",

      {

        timeZone:
          "UTC",

        hour:
          "numeric",

        minute:
          "2-digit",

        hour12:
          true

      }

    );

}



function formatHour(
  unix
) {

  const date =

    new Date(

      (
        unix +
        timezoneOffset
      )

      *

      1000

    );


  return date
    .toLocaleTimeString(

      "en-US",

      {

        timeZone:
          "UTC",

        hour:
          "numeric",

        hour12:
          true

      }

    );

}



function formatWeekday(
  unix
) {

  const date =

    new Date(

      (
        unix +
        timezoneOffset
      )

      *

      1000

    );


  return date
    .toLocaleDateString(

      "en-US",

      {

        timeZone:
          "UTC",

        weekday:
          "short"

      }

    );

}



function formatDateTime(
  unix
) {

  const date =

    new Date(

      (
        unix +
        timezoneOffset
      )

      *

      1000

    );


  return date
    .toLocaleString(

      "vi-VN",

      {

        timeZone:
          "UTC"

      }

    );

}



/* =========================================================
   BACKGROUND
========================================================= */

function updateBackground(
  weather
) {

  let image =

    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b";


  if (
    weather ===
    "Clouds"
  ) {

    image =

      "https://images.unsplash.com/photo-1499346030926-9a72daac6c63";

  }


  else if (

    weather ===
    "Rain"

    ||

    weather ===
    "Drizzle"

  ) {

    image =

      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0";

  }


  else if (
    weather ===
    "Snow"
  ) {

    image =

      "https://images.unsplash.com/photo-1483664852095-d6cc6870702d";

  }


  else if (
    weather ===
    "Thunderstorm"
  ) {

    image =

      "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28";

  }


  document.body.style.backgroundImage =

    `linear-gradient(
      rgba(0,0,0,0.12),
      rgba(0,0,0,0.25)
    ),
    url("${image}")`;

}



/* =========================================================
   CARD IMAGE
========================================================= */

function updateCardImage(
  weather
) {

  let image =

    "https://images.unsplash.com/photo-1566010503302-2564ae0d47b6";


  if (
    weather ===
    "Clouds"
  ) {

    image =

      "https://images.unsplash.com/photo-1534088568595-a066f410bcda";

  }


  else if (

    weather ===
    "Rain"

    ||

    weather ===
    "Drizzle"

  ) {

    image =

      "https://images.unsplash.com/photo-1433863448220-78aaa064ff47";

  }


  weatherImage.style.backgroundImage =

    `linear-gradient(
      rgba(0,0,0,0.05),
      rgba(0,0,0,0.45)
    ),
    url("${image}")`;

}



/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(
  text
) {

  if (!text) {

    return "";

  }


  return

    text
      .charAt(0)
      .toUpperCase()

    +

    text.slice(1);

}



/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
  text
) {

  message.textContent =
    text;


  message.style.display =
    "block";


  setTimeout(

    () => {

      message.style.display =
        "none";

    },

    3500

  );

}



/* =========================================================
   BUTTON CLICK
========================================================= */

searchBtn.addEventListener(

  "click",

  searchCity

);



/* =========================================================
   ENTER SEARCH
========================================================= */

searchInput.addEventListener(

  "keydown",

  event => {

    if (
      event.key ===
      "Enter"
    ) {

      searchCity();

    }

  }

);



/* =========================================================
   CLICK OUTSIDE AUTOCOMPLETE
========================================================= */

document.addEventListener(

  "click",

  event => {

    if (

      !event.target.closest(
        ".search-wrapper"
      )

    ) {

      suggestions.innerHTML =
        "";

    }

  }

);



/* =========================================================
   DEFAULT LOCATION
   HO CHI MINH CITY
========================================================= */

loadWeather(

  10.8231,

  106.6297

);