(function ($) {
    "use strict";
    $(document).ready(function () {
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
        let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        let months = {
            "01": "January",
            "02": "February",
            "03": "March",
            "04": "April",
            "05": "May",
            "06": "June",
            "07": "July",
            "08": "August",
            "09": "September",
            "10": "October",
            "11": "November",
            "12": "December"
        }
        let currentDate = new Date();
        const convertTime = () => {
            if (currentDate.getHours() === 0 && currentDate.getMinutes() <= 9) {
                return "12" + " : 0" + currentDate.getMinutes() + " am"
            } else if (currentDate.getHours() === 0 && currentDate.getMinutes() > 9) {
                return "12" + " : " + currentDate.getMinutes() + " am"
            } else if (currentDate.getHours() === 12 && currentDate.getMinutes() <= 9) {
                return "12" + " : 0" + currentDate.getMinutes() + " pm"
            } else if (currentDate.getHours() === 12 && currentDate.getMinutes() > 9) {
                return "12" + " : " + currentDate.getMinutes() + " pm"
            } else if (currentDate.getHours() > 12 && currentDate.getMinutes() > 9) {
                return (currentDate.getHours() - 12) + " : " + currentDate.getMinutes() + " pm"
            } else if (currentDate.getHours() > 12 && currentDate.getMinutes() <= 9) {
                return (currentDate.getHours() - 12) + " : 0" + currentDate.getMinutes() + " pm"
            } else if (currentDate.getHours() < 12 && currentDate.getMinutes() <= 9) {
                return currentDate.getHours() + " : 0" + currentDate.getMinutes() + " am"
            } else {
                return currentDate.getHours() + " : " + currentDate.getMinutes() + " am"
            }
        }

        const tempConversion= (temp) => Math.trunc((temp - 273.15) * 9 / 5 + 32) + "&#176 F  /  " + Math.trunc((temp - 273.15)) + "&#176 C";

        const monthRender = string => {
            let output = "";
            for(let element of Object.keys(months)) {
                if (element === (string[5] + string[6])) {
                    output = element;
                }
            }
            return months[output];
        }

        const dayRender = string => string[8] + string[9];

        mapboxgl.accessToken = MAPBOX_TOKEN;
        let map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 0],
            zoom: 9
        });
        let mapDiv = document.getElementById('map');
        if (mapDiv.style.visibility === true) map.resize();

        const mapActivate = () => {
            $('#header_current').removeClass('d-none')
            $('#other_message').addClass('d-none')
        }

        const mapFly = (long, lat) => {
            map.flyTo({
                center: [long, lat],
                essential: true
            });
        }

        function addMarker(long, lat) {
            $('.mapboxgl-marker').remove()
            let marker = new mapboxgl.Marker({
                draggable: true
            })
                .setLngLat([long, lat])
                .addTo(map);

            function onDragEnd() {
                var lngLat = marker.getLngLat();
                $('#header_current, #fiveDay').children().remove();
                updateCoord(lngLat.lng, lngLat.lat);
            }

            marker.on('dragend', onDragEnd);
            return marker;
        }

        function toggleLoad() {
            return $('header').toggleClass('d-none')
        }

        function cardBody(tempData, weather, hum) {
            return "<ul class='list-group list-group-flush weather_content'> <li class='list-group-item py-2'>" + tempConversion(tempData) + "</li> <li class='list-group-item py-2'>" + weather.toUpperCase() + "</li> <li class='list-group-item py-2'>Humidity : " + hum + "%</li> </ul>\n"
        }


        function currentCard(data) {
            $('#header_current').append("<h2 id='head_info' class='text-center mb-5'>D-weather for " + data.name + ", " + data.sys.country + " is: </h2>")
                .append("<div class='card container weather_card text-center p-0 current_card'><div class='card-header card_top'><h4>" + days[currentDate.getDay()] + "</h4></div><h5 class='card-title my-3 weather_month'>" + month[currentDate.getMonth()] + " " + currentDate.getDate() + "</h5><img class='container' src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png' class='card-img-top' alt='...'> <div class='card-body py-0'>  <p class='card-text'>" + cardBody(data.main.temp, data.weather[0].description, data.main.humidity) + "</p> <p class='card-text'><small class='text-muted'>Last updated at " + convertTime() + "</small></p> </div> </div>"
                )
        }

        function fiveCard(info) {
            $('#five_title').removeClass('d-none');
            let dayUpdate = 1;
            for (let i = 0; i <= 32; i += 8) {
                $('#fiveDay').append("<div class='card container weather_card mx-3 text-center p-0 small_card mb-3'><div class ='card-header card_top'><h4>" + days[(currentDate.getDay() + dayUpdate)] + "</h4></div><h5 class='card-title my-3 weather_month'>" + monthRender(info.list[i].dt_txt) + " " + dayRender(info.list[i].dt_txt) + "</h5><img class='container' src='http://openweathermap.org/img/w/" + info.list[i].weather[0].icon + ".png' class='card-img-top' alt='...'> <div class='card-body py-0'>  <p class='card-text'>" + cardBody(info.list[i].main.temp, info.list[i].weather[0].description, info.list[i].main.humidity) + "</p></div></div>")
                dayUpdate += +1;
            }
        }

        function updateCoord(lng, lat) {
            toggleLoad();
            $.get("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&appid=" + OPENW_TOKEN).done(function (data) {
                toggleLoad();
                mapActivate();
                currentCard(data);
                mapFly(lng, lat);
                addMarker(lng, lat);

                $.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lng + "&appid=" + OPENW_TOKEN).done(function (info) {
                    fiveCard(info);
                    console.log(info);

                })
            })
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                alert("Browser doesn't support geolocation.")
            }
        }

        function showPosition(position) {
            $('#splash').toggleClass('d-none')
            updateCoord(position.coords.longitude, position.coords.latitude)
        }

        $('.input_button').click(function () {
            $('#splash').addClass('d-none')
            toggleLoad();
            let input = $('.input_text').val()
            if (input.length === 5 && Number.isInteger(parseInt(input)) && input.includes('.') !== true) {
                $.get("http://api.openweathermap.org/data/2.5/weather?zip=" + input + "&appid=" + OPENW_TOKEN).done(function (data) {
                    $('#header_current, #fiveDay').children().remove();
                    toggleLoad();
                    mapActivate();
                    currentCard(data);
                    mapFly(data.coord.lon, data.coord.lat)
                    addMarker(data.coord.lon, data.coord.lat)
                    $.get("http://api.openweathermap.org/data/2.5/forecast?zip=" + input + "&appid=" + OPENW_TOKEN).done(function (info) {
                        fiveCard(info);
                    })
                })
            } else {
                $.get("http://api.openweathermap.org/data/2.5/weather?q=" + input + "&appid=" + OPENW_TOKEN).done(function (data) {
                    $('#header_current, #fiveDay').children().remove();
                    toggleLoad();
                    mapActivate();
                    currentCard(data);
                    mapFly(data.coord.lon, data.coord.lat)
                    addMarker(data.coord.lon, data.coord.lat)
                    $.get("http://api.openweathermap.org/data/2.5/forecast?q=" + input + "&appid=" + OPENW_TOKEN).done(function (info) {
                        fiveCard(info);
                    })
                }).fail(function () {
                    $('#header_current, #fiveDay').children().remove();
                    toggleLoad();
                    $('#splash').css('background-color', 'var(--accent-color)').toggleClass('d-none')
                    $("#splash h1").html("Error Location Not Found")
                    $('#cloud_logo').html('<i class="fas fa-sad-tear"></i>')
                    $('#splash h2').html('Please enter valid city name or zipcode.')
                })
            }
        })
        getLocation();

    })
})(jQuery)
