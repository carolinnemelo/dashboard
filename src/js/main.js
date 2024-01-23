
import '../scss/styles.scss';
import * as bootstrap from 'bootstrap';
import axios from 'axios';
import {openAPIkey, accessKey} from '../js/apis'


let tempToday = "";
let sessionObject = {};

//------------------------------------LINKS + NAME

function testSessionObject() {
    const storedSessionObject = JSON.parse(localStorage.getItem("sessionObjectInLS"));// I need to put the constant here and then the if, otherwise it is confusing.

    if (storedSessionObject || Object.keys(sessionObject).length > 0) { // this object.key()returns an array, that is why I can use the .length, .length is just for arrays!!!!
        
        sessionObject = storedSessionObject;
        
    } else {
        sessionObject = {
            user: {
                name: "",
                age: null,
                address: "none" 
            },
            notes: {
                content: ""
            },
            links:[
                    {
                        name: 'Google',
                        linkUrl: 'google.com',
                        favIconsUrl:`https://www.google.com/s2/favicons?domain=google.com`
                    }
            ],
            themes: {
                light:"",
                dark: "",
                creative:""
            },
            climate: {
                tempToday: '',
                skyToday:'',
                tempTomorrow: '',
                skyTomorrow: ''

            }
        };
        
        window.localStorage.setItem("sessionObjectInLS", JSON.stringify(sessionObject));

    }
}

testSessionObject();

let inputDash = document.querySelector('.inputDash');
inputDash.addEventListener("input", () => saveDashboardName())



// -----------------------ON  WINDOW LOAD

document.addEventListener('DOMContentLoaded', () => {
    inputDash.value = sessionObject.user.name;
    getDateAndTime()
    showLinksStoredInSessionObject()
    showNote();
    getJokes()
    getLocation();  
    const changeBackgroundBtn = document.querySelector('#changeBackgroundBtn');
    const addLinkBtn = document.querySelector("#addLinkBtn");
    const ulLinkList = document.querySelector("#ulLinkList").firstElementChild;
    ulLinkList.style.display = "none";
    
});

// -----------------------ENDS ON  WINDOW LOAD


function saveDashboardName() {
    
    sessionObject.user.name = inputDash.value;
    window.localStorage.setItem("sessionObjectInLS", JSON.stringify(sessionObject));
}


function showLinksStoredInSessionObject() {
    const ulLink = document.querySelector(".ulLink");
    const sourceLi = document.querySelector(".sourceLi");
    const links = sessionObject.links;

    if (Array.isArray(links) && links.length > 0 ) {
        links.forEach(linkStored => {
            const newLi = sourceLi.cloneNode(true);
            const linkName = linkStored.name;
            const linkUrl = linkStored.linkUrl;
            const favIconsUrl = linkStored.favIconsUrl;
            
            const linkElement = newLi.querySelector("a");
            linkElement.textContent = linkName;
            linkElement.href = linkUrl;
            
            const imgIconTag = newLi.querySelector('img');
            imgIconTag.src = favIconsUrl;

            ulLink.appendChild(newLi);
            newLi.style.display = 'list-item';
        });
    }
}


addLinkBtn.addEventListener('click', () => {
    
    const linkName = prompt("Enter link name");
    const linkUrl = prompt("Link URL:");

    if (linkUrl !== "" && isValidUrl(linkUrl)===true) { // linkUrl !== "" , this is not a empty string
        
        const ulLink = document.querySelector(".ulLink");
        const sourceLi = document.querySelector(".sourceLi");
        const newLi = sourceLi.cloneNode(true);
        const links = sessionObject.links;
        let favIconsUrl;
        const linkElement = newLi.querySelector("a");
        linkElement.textContent = linkName;
        linkElement.href = linkUrl;
    
        const imgIconTag = newLi.querySelector("img")
        favIconsUrl = `https://www.google.com/s2/favicons?domain=${linkUrl}`;
        imgIconTag.src = favIconsUrl;
    
        ulLink.appendChild(newLi);
        newLi.style.display = 'list-item';
        links.push(
            {
            name: linkName, 
            url: linkUrl, 
            favIconsUrl: favIconsUrl
            }
        );
    
        // update session storage
        window.localStorage.setItem("sessionObjectInLS", JSON.stringify(sessionObject));

    } else if (linkUrl === "" || linkUrl === 0) {
        alert('Invalid URL')
    } else{
        alert('Invalid URL')
    }
    

    
    // push to sessionObject
    

});

//------------------------------------TEST URL, it was adding invalid links
function isValidUrl(string) {
    const urlPattern = new  RegExp(
        '^(https?:\\/\\/)?' + // it is optional because of the "?" but other than that I did not understand.
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
        '((\\d{1,3}\\.){3}\\d{1,3}))' + 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' + 
        '(\\#[-a-z\\d_]*)?$',
        'i'
    );
    return  urlPattern.test(string);
    
}




//------------------------------------WEATHER 

// function testSessionObjectForClimate() {
//     const storedSessionObject = JSON.parse(sessionStorage.getItem("sessionObjectInSS"));
//     const storedClimate = storedSessionObject.climate;
//     if(typeof storedClimate.tempToday !== 'number' && typeof storedClimate.tempTomorrow !== 'number') {
//         getLocation();  

//     } else {
//         sessionObject.climate = storedSessionObject;
//         putWeatherInfoInHTML();
//     }
    
// }
    

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
    }
      
    function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    fetchData(lat, lon);
    
}
 
async function fetchData(lat, lon) {
    
    const urlWeather = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openAPIkey}&units=metric`;

    
    try {
        const response = await axios.get(urlWeather);
        tempToday = await response.data.list[0].main.temp;
        const listArrayToday = await response.data.list[0];
        const skyToday = await listArrayToday.weather[0].description;     
        const iconToday = await listArrayToday.weather[0].icon;
        const listArrayTomorrow = await response.data.list[4];
        const tempTomorrow = await listArrayTomorrow.main.temp;
        const skyTomorrow = await listArrayTomorrow.weather[0].description
        const iconTomorrow = await listArrayTomorrow.weather[0].icon;

        
        if (!sessionObject.climate) {
            sessionObject.climate = {};
            
        }
        
        sessionObject.climate = {skyToday, tempToday, iconToday, tempTomorrow, skyTomorrow, iconTomorrow}; //Sandra's way to make it shorter, same key and value name can be just one word.
        
        window.localStorage.setItem("sessionObjectInLS", JSON.stringify(sessionObject));
    } catch (error) {
        console.log("Error");
    }
    
    putWeatherInfoInHTML();
    
}





                
                
//--------------Put weather in the HTML

async function putWeatherInfoInHTML() {
    sessionObject = JSON.parse(localStorage.getItem("sessionObjectInLS"));
    
    const tempTodayElement = document.querySelector('#tempTodayElement');
    const tempTomorrowElement = document.querySelector('#tempTomorrowElement');
    const skyTodayElement = document.querySelector('#skyTodayElement');
    const skyTomorrowElement = document.querySelector('#skyTomorrowElement');
    
    const liWeatherToday = document.querySelector('#liWeatherToday')
    const liWeatherTomorrow = document.querySelector('#liWeatherTomorrow')
    
    const imgIconTagToday = liWeatherToday.querySelector('#imgToday');
    const imgIconTagTomorrow = liWeatherTomorrow.querySelector('#imgTomorrow');
    
    // const iconToday = sessionObject.climate.iconToday;
    // const iconTomorrow = sessionObject.climate.iconTomorrow;

    // attempt to make deconstructing
    const {iconToday,iconTomorrow} = sessionObject.climate
    // attempt to make deconstructing
    
    skyTodayElement.textContent = sessionObject.climate.skyToday;
    skyTomorrowElement.textContent = sessionObject.climate.skyTomorrow;
    
    tempTodayElement.textContent = `${sessionObject.climate.tempToday}°C`;
    tempTomorrowElement.textContent = `${sessionObject.climate.tempTomorrow}°C`;

    imgIconTagToday.src = `https://openweathermap.org/img/wn/${iconToday}@2x.png`;
    imgIconTagTomorrow.src = `https://openweathermap.org/img/wn/${iconTomorrow}@2x.png`;



    // update session storage
    window.localStorage.setItem("sessionObjectInLS", JSON.stringify(sessionObject));


    
}



//------------------------------------BACKGROUND

changeBackgroundBtn.addEventListener('click', async function () {
    const backgroundUrl = `https://api.unsplash.com/photos/random/?client_id=${accessKey}&orientation=landscape`;
    

    try {
        const response = await axios.get(backgroundUrl);
        const picHTML = await response.data.urls.regular
        const body = document.querySelector('#body');

        body.style.backgroundImage = `url(${picHTML})`;
        body.style.backgroundSize = 'cover';
        
    } catch (error) {
        console.log('err no unsplash');
    }

})

//------------------------------------DATE AND HOURS

function getDateAndTime() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const date = new Date();
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    let month = months[date.getMonth()];

    const hourElement = document.querySelector('#hour');
    const dateElement = document.querySelector('#date');

    hourElement.textContent = `${day} ${month} ${year}`
    dateElement.textContent = `${hour}:${minutes}`

}

//------------------------------------NOTES

let notesTextArea = document.querySelector('#notes');
notesTextArea.addEventListener("input", () => saveNote())

function saveNote() {
    let noteContent = notesTextArea.value;
    sessionObject.notes = {
        content: noteContent
    };
    
    
    window.localStorage.setItem("sessionObjectInLS", JSON.stringify(sessionObject));
    
}

function showNote() {
    notesTextArea.textContent = sessionObject.notes.content;

    console.log(notesTextArea.textContent);
}


//------------------------------------JOKES

async function getJokes() {

    const ninjaUrl = `https://icanhazdadjoke.com/slack`;
    
    try {
        const response = await axios.get(ninjaUrl);
        const joke = response.data.attachments[0].text;
        const jokeElement = document.querySelector('#joke');
        jokeElement.textContent = joke;
    } catch (error) {
        console.error(error);
    }
    
}




//TO DO:

// fix the weather to fetch by timestamp

// make the window load only when everything is ready

// save the timestamp on local storage and  check if it is the same day so it does not need to fetch every time the page loads

// change the style of the buttons

// change responsiveness because it is very big when changes to tablet
// separate change background button, dashboard name, and date/time in tablet, 
// it is everything too close 
// from tablet to mobile. 


// make a minimum size for the window

// update time every second