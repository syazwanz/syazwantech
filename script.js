const liveView = document.getElementById('liveView');
const video = document.getElementById('webcam');
const enableWebcamButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const loading = document.getElementById('loading');
const aiContainer = document.getElementById('ai-container');

function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
    stopButton.addEventListener('click', disableCam);
    console.log('hooray!')
} else {
    console.warn('getUserMedia() is not supported by your browser');
}


function enableCam(event) {

    if (!model) {
        return;
    }

    // getUsermedia parameters to force video but not audio.
    const constraints = {
        // video: true,
        video: {
            facingMode: "environment"
        }
    };

    // activate webcam
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.style.display = 'block';
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);


        enableWebcamButton.style.display = 'none';
        stopButton.style.display = 'block';
    });
}

function disableCam(event) {

    if (!model) {
        return;
    }

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(function (track) {
            track.stop();
            enableWebcamButton.style.display = 'block';
            stopButton.style.display = 'none';
            video.style.display = 'none';

            console.log('STOP!')
        });
    }
}

var children = [];

function predictWebcam() {
    // Now let's start classifying a frame in the stream.
    model.detect(video).then(function (predictions) {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]);
        }
        children.splice(0);


        for (let n = 0; n < predictions.length; n++) {
            if (predictions[n].score > 0.1) {

                const p = document.createElement('p');

                p.innerText = predictions[n].class + ' '
                    + (predictions[n].score).toFixed(2);

                p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                    + (predictions[n].bbox[1] - 0) + 'px; width: '
                    + (predictions[n].bbox[2] - 40) + 'px; top: 0; left: 0;';

                const highlighter = document.createElement('div');

                highlighter.setAttribute('class', 'highlighter');

                highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                    + (predictions[n].bbox[1] - 0) + 'px; width: '
                    + (predictions[n].bbox[2] - 0) + 'px; height: '
                    + (predictions[n].bbox[3] - 0) + 'px;';

                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter);
                children.push(p);
            }
        }

        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictWebcam);
    });
}

var model = undefined;

//load model
cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    loading.remove();
    aiContainer.style.display = 'flex'
    console.log('Model loaded!')
});


if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    console.log("mobile device");
    alert('Not optimized for mobile viewing!')
} else {
    // false for not mobile device
    console.log("not mobile device");
}