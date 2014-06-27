//figuring out the youtube js api (for iframe embedded video)
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var playerDiv = document.getElementById('player');
playerDiv.appendChild(tag);

//City of Winnipeg YouTube account: https://www.youtube.com/user/thecityofwinnipeg
//Council Videos playlist: https://www.youtube.com/playlist?list=PLbfdx_X_36N0P-A_PalMevzQVr_gAshwA

//Constants
//note: videoNames are also JSON (hansard data) file names.
var videoNames = ["2014-01-29","2013-12-17", "2013-12-11", "2013-11-20",  "2013-11-06", "2013-10-23", "2013-10-22", "2013-09-25", "2013-07-17", "2013-06-26", "2013-05-29", "2013-04-24", "2013-03-20", "2013-02-27", "2013-01-30", "2013-01-29"];
var videoIds =  ["ZbHzXWE1hYs", "EvTTS1dR-xM", "d-UFuzJYIOE", "Gb7-bJbn8vM", "OHVBApCdZAM","e1D_CWBa1yI","zqG4yMqNYrc","HdHBab-HO3M","nIb47yirpbg","anWZeM4UstA","gd8Ws6wNzk4","37aqoCCYqFY","4XolNOj_E90","gg3ZsbJ-Y68","6G4eDzavccc","XMlO21fNdZ0"];
var currentVidId;
var currentVidName;
var councillors =  ["Other", "Clerk", "Madam Speaker", "Mayor Katz", "Councillor Sharma", "Councillor Browaty", "Councillor Eadie", "Councillor Fielding", "Councillor Gerbasi", "Councillor Havixbeck", "Councillor Mayes", "Councillor Nordman", "Councillor Orlikow", "Councillor Pagtakhan", "Councillor Smith", "Councillor Steen", "Councillor Swandel", "Councillor Vandal", "Councillor Wyatt"];

//DOM stuff
var d = document;
var head = document.getElementsByTagName("head")[0];
var videosSelect = d.getElementById("videos");
var currentTime = d.getElementById("currentTime");
var videoState = d.getElementById("videoState");
var speed = d.getElementById("speed");
var videoUrl = d.getElementById("videoUrl");
var councillorsSelect = d.getElementById("councillors");
var speakingTypesSelect = d.getElementById("speakingTypes");
//councillor start and end
var videoId = d.getElementById("videoId");
var videoTitle = d.getElementById("videoTitle");
var councillorStart = d.getElementById("councillorStart");
var councillorEnd = d.getElementById("councillorEnd");
var notes = d.getElementById("notes");
var clipLength = d.getElementById("clipLength");
var hansardSelect = d.getElementById("hansardSelect");
var hansardFullText = d.getElementById("hansardFullText");
var wordsPerMinute = d.getElementById("wordsPerMinute");
//saving
var saveHistory = d.getElementById("saveHistory");
var persistTextarea = document.getElementById("persistedJSON");


//set event listeners of buttons
d.getElementById("play").addEventListener("click", play, false);
d.getElementById("pause").addEventListener("click", pause, false);
d.getElementById("recordStart").addEventListener("click", recordStart, false);
d.getElementById("recordEnd").addEventListener("click", recordEnd, false);
d.getElementById("save").addEventListener("click", saveRow, false);
d.getElementById("deleteRow").addEventListener("click", deleteRow, false);
d.getElementById("persistToTextArea").addEventListener("click", persistToTextArea, false);
d.getElementById("loadVideo").addEventListener("click", loadVideo, false);
d.getElementById("loadHansard").addEventListener("click", loadHansard, false);
d.getElementById("reverseEvenMore").addEventListener("click", reverseEvenMore, false);
d.getElementById("reverseMore").addEventListener("click", reverseMore, false);
d.getElementById("reverse").addEventListener("click", reverse, false);
d.getElementById("forward").addEventListener("click", forward, false);
d.getElementById("forwardMore").addEventListener("click", forwardMore, false);
d.getElementById("forwardEvenMore").addEventListener("click", forwardEvenMore, false);
d.getElementById("nextHansardRow").addEventListener("click", selectNextHansardRow, false);
d.getElementById("previousHansardRow").addEventListener("click", selectPreviousHansardRow, false);
d.getElementById("persistedJSON").addEventListener("click", function() {
    // This ensures that when someone clicks on the persisted CSV the textarea selects-all.
    this.focus();
    this.select();
}, false);
councillorStart.addEventListener("blur", calculateClipLength, false);
councillorEnd.addEventListener("blur", calculateClipLength, false);


hansardSelect.addEventListener("change", hansardSelectChanged , false);

function hansardSelectChanged() {
    if (selectedHansardRow()) {
        onHansardRowChange();
    }
}

// Warn users if they try to navigate away from the app.
window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = "Are you sure you wish to navigate away from the app? Unsaved changes will be lost.";
    (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
    return confirmationMessage;                                //Webkit, Safari, Chrome etc.
});

// ************************************************** Helper Functions

function onHansardRowChange() {
    hansardFullText.value = selectedHansardRowText();
    setSpeakerName();
    setSpeakerType();
    setSpeakersText();
}

function setSpeakersText() {
    var g = currentHansardGroup();
    for (var key in g) {
        if (g.hasOwnProperty(key)) {
            var currentSpeaker = g[key] 
            var element = document.getElementById(key);
            element.innerHTML = '';
            var h4 = document.createElement('h4');
            h4.innerHTML = currentSpeaker.name;
            if (currentSpeaker.moved_by) {
                h4.innerHTML += " (" + currentSpeaker.moved_by + ")";
            }
            var p = document.createElement('p');

            var spoken = '';
            if (currentSpeaker.spoken) {
                spoken = currentSpeaker.spoken;
            } else if (currentSpeaker.motion_text) {
                spoken = currentSpeaker.motion_text;
            } else if (currentSpeaker.outcome) {
                spoken = currentSpeaker.outcome + ' -- yeas: ' + currentSpeaker.yeas + ' -- nays: ' + currentSpeaker.nays;
            }

            var wordsSpoken = wordCount(spoken);
            if (wordsSpoken > 0) {
                var wpm = wordsPerMinute.value;
                var spokenTimeGuess = 60 * wordsSpoken / wpm;
                spokenTimeGuess = ('' + spokenTimeGuess).toHHMMSS();
                spoken = wordsSpoken + ' words - ' + spokenTimeGuess + '? - ' + spoken;
            }

            p.innerHTML  = truncateText(spoken);
            element.appendChild(h4);
            element.appendChild(p);
        }
    } 
    
}

function truncateText(originalText) {
    if (originalText.length < 150) {
        return originalText;
    } else {
        var length = originalText.length;
        return originalText.substring(0, 75) + ' ... ' + originalText.substring(length-75, length);
    }
}

function resetFormTextfields() {
    councillorStart.value = '';
    councillorEnd.value   = '';
    clipLength.value      = '';
    notes.value           = '';
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time;
    time  = (hours == 0) ? '' : hours + ':';
    time += minutes + ':' + seconds;
    return time;
}

function wordCount(stringToCount) {
    if (!stringToCount) return 0;
    var regex = /\s+/gi;
    var wordCount = stringToCount.trim().replace(regex, ' ').split(' ').length;
    return wordCount;
}

function twoDecimalRound(number) {
    return Math.round(100 * number) / 100;
}

function displayLastSavedDetails(jsonrow) {
    var lastSavedDetailsElement = document.getElementById('lastSavedDetails');
    var h4 = document.createElement('h4');
    var strong = document.createElement('strong');
    var p  = document.createElement('p');
    var spoken = (jsonrow.hansard.spoken) ? jsonrow.hansard.spoken : jsonrow.hansard.motion_text;
    var wordsSpoken = wordCount(spoken);
    var lengthInMinutes = twoDecimalRound(jsonrow.length / 60);
    var wordsPerMinute = Math.round(wordsSpoken / lengthInMinutes);
    var timeText = document.createTextNode(' said ' + wordsSpoken + 
                                           ' words in ' + lengthInMinutes + 
                                           ' minutes, at a rate of ' + wordsPerMinute + ' words per minute.' + 
                                           ' {' + jsonrow.start_time.toHHMMSS() + 
                                           ' - ' + jsonrow.end_time.toHHMMSS() + '}'); 
    lastSavedDetailsElement.innerHTML = '';
    h4.innerHTML = 'Last Saved';
    strong.innerHTML = jsonrow.councillor;
    p.appendChild(strong);
    p.appendChild(timeText);
    lastSavedDetailsElement.appendChild(h4);
    lastSavedDetailsElement.appendChild(p);
}

// Set the "Speaking Type" select drop-down from the selected Hansard data.
function setSpeakerType() {
    var speakerType = selectedHansardJSON().type;
    setSelectByValue(speakingTypesSelect, speakerType);
}

function setSpeakerName() {
    setSelectByValue(councillorsSelect, selectedHansardCouncillorName());
    if (councillorsSelect.selectedIndex == 0) {
        notes.value = selectedHansardCouncillorName();
    } else {
        notes.value = "";
    }
}

function selectedHansardCouncillorName() {
    var councillorName,
        hansardRow = selectedHansardJSON();
    switch(hansardRow.type) {
        case 'vote':
            councillorName = 'Clerk';
            break;
        case 'motion':
            councillorName = hansardRow.moved_by;
            break;
        default:
            councillorName = hansardRow.name;
    }
    
    return councillorName;
}

function selectNextHansardRow() {
    var selectedIndex = hansardSelect.selectedIndex,
        selectLength  = hansardSelect.options.length;
        
    if (selectedIndex != selectLength - 1) {
        selectedIndex++;
    }

    hansardSelect.selectedIndex = selectedIndex;

    onHansardRowChange();
}

function selectPreviousHansardRow() {
    var selectedIndex = hansardSelect.selectedIndex,
        selectLength  = hansardSelect.options.length;
        
    if (selectedIndex != 0) {
        selectedIndex--;
    }

    hansardSelect.selectedIndex = selectedIndex;


    onHansardRowChange();
}

function currentHansardGroup() {
    var index   = hansardSelect.selectedIndex,
        length  = hansardSelect.options.length;

    var previous = (index == 0) ? { 'name': '', 'spoken':'' } : JSON.parse(hansardSelect.options[index - 1].text);
    var current  = JSON.parse(hansardSelect.options[index].text);
    var next     = (index == length - 1) ? { 'name': '', 'spoken':'' } : JSON.parse(hansardSelect.options[index + 1].text);
    return { 'previousSpeaker': previous, 
             'currentSpeaker':  current,
             'nextSpeaker':     next };
}

function selectedHansardRow() {
    return hansardSelect.options[hansardSelect.selectedIndex];
}

function selectedHansardRowText() {
    return selectedHansardRow().text;
}

function selectedHansardJSON() {
    return JSON.parse(selectedHansardRowText());
}

function setSelectByValue(selectEntity, valueToSelect) {
    var foundValueAndSetIndex = false;
    for(var i = 0, j = selectEntity.options.length; i < j; ++i) {
        if(selectEntity.options[i].value === valueToSelect) {
           selectEntity.selectedIndex = i;
           foundValueAndSetIndex = true;
           break;
        }
    }
    if (!foundValueAndSetIndex) {
        selectEntity.selectedIndex = 0;
    }
}
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
}


//The API will call this function when the video player is ready.
function onPlayerReady(event) {
    videoUrl.value = player.getVideoUrl();
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
}


//**********************************Saving Video Clip Data *********************
//saves video info and current councillor start and end data to collection
//(currently just displaying)
function saveRow(){
    //insert row into multi-line select
    var option = d.createElement("option");
    var startTimeForUrl = Math.floor(councillorStart.value); //with no fractional part
    var videoUrlWithStartTime = "www.youtube.com/watch?v=" + currentVidId + "&t=" + startTimeForUrl;
    if (hansardSelect.options[hansardSelect.selectedIndex]) {
        // Parsing out the selected hansard data into a js object using JSON.parse.
        var selectedHansardJSON = JSON.parse(hansardSelect.options[hansardSelect.selectedIndex].text);
        var speakingType = speakingTypesSelect.options[speakingTypesSelect.selectedIndex].text;
        var selectedCouncillor = councillorsSelect.options[councillorsSelect.selectedIndex].value;
        var validationError;
        
        // Warning if the handsard row type doesn't match the user selected speaking type.
        if ((selectedHansardJSON.type == 'speaker' && speakingType != 'Speaking')
            || (selectedHansardJSON.type == 'motion' && speakingType != 'Motion Reading')) {
            validationError = "Selected speaking type doesn't match selected hansard row.";
        }
        
        // Warning if the user selected speaker doesn't match the selected hansard row.
        if ((selectedHansardJSON.type == 'speaker') && (selectedCouncillor != 'Other') && (selectedCouncillor != selectedHansardJSON.name)){
            validationError = "Selected speaker doesn't match selected hansard row.";
        }
        
        // Warn if clip length is zero.
        if (clipLength.value == 0) {
            validationError = "Are you sure you wish to save a record with a duration of zero? "
        }
        
        // Display validation warning if there is one. Quit function if user hits cancel on confirm modal. 
        if (validationError && !confirm(validationError + "\nOK to proceed. Cancel to fix.")) {
            return;
        }
        
        var json_row = {
                        'video_id':     currentVidId,
                        'video_name':   currentVidName,
                        'councillor':   selectedCouncillor,
                        'start_time':   councillorStart.value,
                        'end_time':     councillorEnd.value,
                        'length':       clipLength.value,
                        'video_url':    videoUrlWithStartTime,
                        'notes':        notes.value,
                        'type':         speakingType,
                        'hansard':      selectedHansardJSON
                        };
        
        // Stringifying the data we have just created into JSON and adding to the saveHistory select.
        var text = d.createTextNode(JSON.stringify(json_row));
        option.appendChild(text);
        saveHistory.appendChild(option);
        selectNextHansardRow();
        resetFormTextfields();
        displayLastSavedDetails(json_row);
    } else {
        alert("You need to select an entry from the Hansard text before you can save.")
    }
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
//copies save history to a textarea to allow for copy/pasting.
function persistToTextArea() {
    //create column headers row
    
    var jsonData = [];
    for(var i = 0; i < saveHistory.length; i++) {
        jsonData.push(JSON.parse(saveHistory.options[i].text));
    }
    persistTextarea.value = JSON.stringify(jsonData);
}


//record start end end times of councillor speaking
function recordStart() {
    videoId.value = currentVidId;
    videoTitle.value = currentVidName;
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
//load selected video and corresponding hansard data from JSON file
function loadVideo() {
    //alert(videoIds[videos.selectedIndex]);
    currentVidId = videoIds[videos.selectedIndex];
    currentVidName = videoNames[videos.selectedIndex];
    hansardJsonFileName = "json/" + currentVidName + ".js";

    //destroy existing player
    if (!typeof player === 'undefined') {
        player.destroy();
    }   
    
    //create new player and attach event handlers
    player = new YT.Player('player', {
        height: 312,
        width: 512, 
        videoId: currentVidId,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
         }
    });
    
    //create script element in document head -- then user has to click the load hansard button
    //because it takes milliseconds to create the hansard variable in the hansard data js file.
    var scriptEle = d.createElement("script");
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("src", hansardJsonFileName);
    head.appendChild(scriptEle);
}

function loadHansard() {
    //load hansard JSON file data into multi-line select
    // The 'hansard' variable is a global loaded by the loadVideo function.
    // In loadVideo hansard.json files are loaded into the hansard variable.
    var h = hansard.hansard;
    for(var i=0; i<h.length; i++) {
        //types: speaker, motion, section, vote
        if(h[i].type == "speaker" || h[i].type == "motion" || h[i].type == "vote") {
            var json_row = h[i];
            var option = d.createElement("option");
            // Stringify our data into JSON to store in the hansardSelect.
            var text = d.createTextNode(JSON.stringify(json_row));
            option.appendChild(text);
            hansardSelect.appendChild(option);
        }
    }
    selectNextHansardRow();
}


//*******************************Basic video functions ************************
function reverseEvenMore() {
    player.seekTo(player.getCurrentTime() - 30, true);
}
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
function forwardEvenMore() {
    player.seekTo(player.getCurrentTime() + 30, true);
}
function showCurrentTime() {
    currentTime.value = player.getCurrentTime();
}
function play() {
    player.playVideo();
    showCurrentTime();
}
function pause() {
    player.pauseVideo();
    showCurrentTime();
}
