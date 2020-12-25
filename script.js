const liveView = document.getElementById('liveView');
const video = document.getElementById('webcam');
const enableWebcamButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');

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
        video: true
    };

    // activate webcam
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
    });
}

function disableCam(event) {

    if (!model) {
        return;
    }

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(function (track) {
            track.stop();
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

        // Now lets loop through predictions and draw them to the live view if
        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {
            // If we are over 66% sure we are sure we classified it right, draw it!
            if (predictions[n].score > 0.5) {
                const p = document.createElement('p');
                p.innerText = predictions[n].class + ' '
                    + (predictions[n].score).toFixed(2)
                // + Math.round(parseFloat(predictions[n].score) * 100)
                // + '% confidence.';
                p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                    + (predictions[n].bbox[1] - 10) + 'px; width: '
                    + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                    + predictions[n].bbox[1] + 'px; width: '
                    + predictions[n].bbox[2] + 'px; height: '
                    + predictions[n].bbox[3] + 'px;';

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
    console.log('Model loaded!')
});