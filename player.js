var canvas = document.getElementById("canvas");
var totalTime = document.getElementById("totalTime");
var currentTime = document.getElementById("currentTime");
var seek = document.getElementById("seek");
var volume = document.getElementById("volume");
var volumeImg = document.getElementById("volumeImg");
var feeds = document.getElementById("feeds");
var ctx = canvas.getContext("2d");

// -----------------------------

var audio = new Audio();
audio.src = "https://www.dropbox.com/s/iv7kenb9csi6hay/01%20-%20Tu%20Meri%20-%20DownloadMing.SE.mp3?dl=0";
audio.type = "audio/mpeg";
seek.value = 0;
volume.value = 20;
audio.volume = .2;
currentTime.textContent = '00 : 00';

audio.oncanplaythrough = function() {
    var totalduration = audio.duration;
    var totalminutes = Math.floor(totalduration / 60);
    var totalseconds = Math.floor(totalduration % 60);
    if (totalminutes < 60) {
        totalminutes = '0' + totalminutes;
    }
    totalTime.textContent = totalminutes + ':' + totalseconds;
}



var play = function() {
    audio.play();
    seek.max = audio.duration;
    volume.min = 0;
    volume.max = 100;
    audio.volume = volume.value / 100;
    feeds.textContent = " Now Playing : " + audio.src;
    visualizer();
}

audio.onended = function() {
    window.cancelAnimationFrame(animationFrame);
}

var pause = function() {
    audio.pause();
    window.cancelAnimationFrame(animationFrame);
}

audio.ontimeupdate = function() {
    var curtime = parseInt(audio.currentTime, 10);
    var min = Math.floor(curtime / 60);
    var sec = curtime % 60;
    if (sec < 10) {
        sec = '0' + sec;
    }
    if (min < 60) {
        min = '0' + min;
    }
    currentTime.textContent = min + " : " + sec;
    seek.value = Math.floor(audio.currentTime);
}

seek.oninput = function() {
    audio.currentTime = seek.value;
}

volume.oninput = function() {
    audio.volume = volume.value / 100;
    if (volume.value > 0 && volume.value < 50)
        volumeImg.src = "volume-down.png";
    else if (volume.value > 50)
        volumeImg.src = "volume-up.png";
    else if (volume.value == 0)
        volumeImg.src = "volume-off.png";
}

// volume and seeking key controls 

var keyEvent = function(event) {
    if (event.keyCode === 38)
        volumeEvent('up');

    else if (event.keyCode === 40)
        volumeEvent('down');

    else if (event.keyCode === 39)
        seekEvent('up');

    else if (event.keyCode === 37)
        seekEvent('down');

    else if (event.keyCode === 77)
        volumeEvent("mute");


    else if (event.keyCode === 80)
        if (audio.paused === false)
            pause();
        else
            play();
}

var seekEvent = function(what) {
    if (what === 'up') {
        audio.currentTime += 5;
    } else if (what === 'down') {
        audio.currentTime -= 5;
    }
}

var volumeEvent = function(what) {
    if (what === 'up' && audio.volume < .9) {
        audio.volume += .1;
        volume.value = audio.volume * 100;
    } else if (what === 'down' && audio.volume > .1) {
        audio.volume -= .1;
        volume.value = audio.volume * 100;
    } else if (what === "mute") {
        if (audio.muted) {
            audio.muted = false;
            volume.value = audio.volume * 100;
        } else {
            audio.muted = true;
            volume.value = 0;
        }
    }

    if (volume.value > 0 && volume.value < 50)
        volumeImg.src = "volume-down.png";
    else if (volume.value > 50)
        volumeImg.src = "volume-up.png";
    else if (volume.value == 0)
        volumeImg.src = "volume-off.png";

}

document.addEventListener("keydown", keyEvent);

// -----------------------------

context = new AudioContext();
analyser = context.createAnalyser();
source = context.createMediaElementSource(audio);
var dataArray;
var bufferLength

function visualizer() {
    source.connect(analyser);
    analyser.connect(context.destination);

    // analyser.fftSize = 2048;
    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);


    frameLooper();
}
var animationFrame;

function frameLooper() {
    animationFrame = window.requestAnimationFrame(frameLooper);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteTimeDomainData(dataArray);


    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255,0.7)';

    ctx.beginPath();

    var sliceWidth = canvas.width * 1.0 / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

}
