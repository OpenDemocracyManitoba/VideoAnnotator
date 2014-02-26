//figuring out the youtube js api (for iframe embedded video)

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var playerDiv = document.getElementById('player');
playerDiv.appendChild(tag);

//Constants
var videoNames = ["2014-01-29 ","2013-12-17 ", "2013-12-11", "2013-11-20",  "2013-11-06", "2013-10-23", "2013-10-22", "2013-09-25", "2013-07-17", "2013-06-26", "2013-05-29", "2013-04-24", "2013-03-20", "2013-02-27", "2013-01-30", "2013-01-29"];
var videoIds = ["ZbHzXWE1hYs", "EvTTS1dR-xM", "d-UFuzJYIOE", "Gb7-bJbn8vM", "OHVBApCdZAM","e1D_CWBa1yI","zqG4yMqNYrc","HdHBab-HO3M","nIb47yirpbg","anWZeM4UstA","gd8Ws6wNzk4","37aqoCCYqFY","4XolNOj_E90","gg3ZsbJ-Y68","6G4eDzavccc","XMlO21fNdZ0"];
var currentVidId;
var currentVidName;
var councillors = ["Browaty","Eadie","Fielding","Gerbasi","Havixbeck","Mayes","Nordman","Orlikow","Pagtakhan","Sharma","Smith","Steen","Swandel","Vandal","Wyatt"];

//DOM stuff
var d = document;
var videosSelect = d.getElementById("videos");
var currentTime = d.getElementById("currentTime");
var videoState = d.getElementById("videoState");
var speed = d.getElementById("speed");
var videoUrl = d.getElementById("videoUrl");
var councillorsSelect = d.getElementById("councillors");
//councillor start and end
var videoId = d.getElementById("videoId");
var videoTitle = d.getElementById("videoTitle");
var councillor = d.getElementById("councillor");
var councillorStart = d.getElementById("councillorStart");
var councillorEnd = d.getElementById("councillorEnd");
var notes = d.getElementById("notes");
var clipLength = d.getElementById("clipLength");
//saving
var saveHistory = d.getElementById("saveHistory");


//set event listeners of buttons
d.getElementById("play").addEventListener("click", play, false);
d.getElementById("pause").addEventListener("click", pause, false);
d.getElementById("stop").addEventListener("click", stop, false);
d.getElementById("restart").addEventListener("click", restart, false);
d.getElementById("mute").addEventListener("click", mute, false);
d.getElementById("unmute").addEventListener("click", unmute, false);
d.getElementById("speedUp").addEventListener("click", speedUp, false);
d.getElementById("slowDown").addEventListener("click", slowDown, false);
d.getElementById("recordStart").addEventListener("click", recordStart, false);
d.getElementById("recordEnd").addEventListener("click", recordEnd, false);
d.getElementById("save").addEventListener("click", saveRow, false);
d.getElementById("deleteRow").addEventListener("click", deleteRow, false);
d.getElementById("copyToClipboard").addEventListener("click", copyToClipboard, false);
d.getElementById("loadVideo").addEventListener("click", loadVideo, false);
d.getElementById("reverseMore").addEventListener("click", reverseMore, false);
d.getElementById("reverse").addEventListener("click", reverse, false);
d.getElementById("forward").addEventListener("click", forward, false);
d.getElementById("forwardMore").addEventListener("click", forwardMore, false);
councillorStart.addEventListener("blur", calculateClipLength, false);
councillorEnd.addEventListener("blur", calculateClipLength, false);



//************************************************* Initialization Events
//This function creates an <iframe> (and YouTube player)
//after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    //should load City of Winnipeg playlist
    //"http://www.youtube.com/channel/UClbGHHM4vS_wK9tVdOld8pQ"
    //and allow selection of the different videos
        //populate videos
    for(var i = 0; i < videoIds.length; i++) {
        var o = document.createElement('option');
        o.innerHTML = videoNames[i];
        o.value = videoIds[i];
        videosSelect.appendChild(o);
    }  

    //populate councillors
    for(var i = 0; i < councillors.length; i++) {
        var o = document.createElement('option');
        o.innerHTML = councillors[i];
        o.value = councillors[i];
        councillorsSelect.appendChild(o);
    }
    
    
  /*player = new YT.Player('player', {
    height: '390',
    width: '640',
    //height:195,
    //width:320,
    videoId: 'tmCKnVaU7H0',
    //videoId: vidId,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });*/
}


//The API will call this function when the video player is ready.
function onPlayerReady(event) {
    
    //for using local HTML storage
    if(typeof(Storage)!=="undefined")
    {
        //storage gtg
    }
    else
    {
        alert("Your browser doesn't support local storage, so this ain't gonna work.");
    }
    
    //event.target.playVideo();
  
    videoUrl.value = player.getVideoUrl();
  

  //debug
  //console.dir(player);
  //console.dir (event.target);
}

//The API calls this function when the player's state changes.
//The function indicates that when playing a video (state=1),
var done = false;
function onPlayerStateChange(event) {
    var state;
    switch(event.data) {
        case YT.PlayerState.ENDED:
            state = "Ended";
            break;
        case YT.PlayerState.PLAYING:
            state = "Playing";
            break;
        case YT.PlayerState.PAUSED:
            state = "Paused";
            break;
        case YT.PlayerState.BUFFERING:
            state = "Buffering";
            break;
        case YT.PlayerState.CUED:
            state = "Cued";
            break;
    }
    videoState.innerHTML = state;
    
  //stop after 6 seconds.
  /*if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stop, 6000);
    done = true;
  }*/
}


//**********************************Saving Video Clip Data *********************
//saves video info and current councillor start and end data to collection
//(currently just displaying)
function saveRow(){
    //insert row into multi-line select
    var option = d.createElement("option");
    var startTimeForUrl = Math.floor(councillorStart.value); //with no fractional part
    var videoUrlWithStartTime = "www.youtube.com/watch?v=" + currentVidId + "&t=" + startTimeForUrl;
    var text = d.createTextNode("\"" + currentVidId +"\",\"" + currentVidName + "\",\"" + councillor.value + "\"," + councillorStart.value + "," + councillorEnd.value + "," + clipLength.value + ",\"" + videoUrlWithStartTime + "\",\"" + notes.value + "\"");
    option.appendChild(text);
    saveHistory.appendChild(option);
}

//deletes selected row from multi-line select
function deleteRow(){
    if(saveHistory.selectedIndex > -1) {
        var selectedRow = saveHistory.selectedIndex;
        var options = saveHistory.getElementsByTagName("option");
        saveHistory.removeChild(options[selectedRow]);
    } else {
        alert("There is no row selected.");
    }
}





//***********************************************************************************
//copies save history to clipboard for pasting into excel, import to db, etc.
function copyToClipboard() {
    var csvData = "";
    for(var i = 0; i < saveHistory.length; i++) {
        //newlines don't seem to work. they show up in the console, but not when pasted into a text editor
        csvData += saveHistory.options[i].text + "\n";
    }
    console.log(csvData);
    window.prompt("Copy to clipboard: Ctrl+C, Enter", csvData);
}













//record start end end times of councillor speaking
function recordStart() {
    videoId.value = currentVidId;
    videoTitle.value = currentVidName;
    councillor.value = councillorsSelect.options[councillorsSelect.selectedIndex].value;
    var roundedTime = Math.round(player.getCurrentTime()*10)/10 //to the tenth of a second
    councillorStart.value = roundedTime;
    showCurrentTime();
}

function recordEnd() {
    var roundedTime = Math.round(player.getCurrentTime()*10)/10 //to the tenth of a second
    councillorEnd.value = roundedTime;
    calculateClipLength();
    showCurrentTime();
}

function calculateClipLength() {
    var len = councillorEnd.value - councillorStart.value;
    clipLength.value = Math.round(len*10)/10;
}



//******************************* Loading Council videos *********************
//load selected video
function loadVideo() {
    //alert(videoIds[videos.selectedIndex]);
    currentVidId = videoIds[videos.selectedIndex];
    currentVidName = videoNames[videos.selectedIndex];

    if (!typeof player === 'undefined') {
        player.destroy();
    }   
    
    player = new YT.Player('player', {
    height: '390',
    width: '640',
    //height:195,
    //width:320,
    //videoId: 'tmCKnVaU7H0',
    videoId: currentVidId,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}












//*******************************Basic video functions ************************

function reverseMore() {
    player.seekTo(player.getCurrentTime() - 10, true);
}
function reverse() {
    player.seekTo(player.getCurrentTime() - 5, true);
}
function forward() {
    player.seekTo(player.getCurrentTime() + 5, true);
}
function forwardMore() {
    player.seekTo(player.getCurrentTime() + 10, true);
}

function showCurrentTime() {
    currentTime.value = player.getCurrentTime();
}

function play() {
    tryingTo.innerHTML = "Play";
    player.playVideo();
    showCurrentTime();
}

function pause() {
    tryingTo.innerHTML = "Pause";
    player.pauseVideo();
    showCurrentTime();
}

function stop() {
    tryingTo.innerHTML = "Stop";
    player.stopVideo();
    showCurrentTime();
}

function restart() {
    tryingTo.innerHTML = "Restart";
    player.seekTo(0, true);
    player.playVideo();
    showCurrentTime();
}

function mute() {
    tryingTo.innerHTML = "Mute";
    player.mute();
}

function unmute() {
    tryingTo.innerHTML = "Unmute";
    player.unMute();
}

function speedUp() {
    tryingTo.innerHTML = "Speed up";
    player.setPlaybackRate(player.getPlaybackRate() + 0.5);
    speed.value = player.getPlaybackRate();
}

function slowDown() {
    tryingTo.innerHTML = "Slow down";
    player.setPlaybackRate(player.getPlaybackRate() - 0.5);
    speed.value = player.getPlaybackRate();
    
}


//jQuery***********************************************************************************
$(document).ready(function() {
    


});
