import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8";

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const webcamButton = document.getElementById("webcamButton");
const statusText = document.getElementById("status");

let handLandmarker = undefined;
let runningMode = "VIDEO";
let lastVideoTime = -1;

// 1. Initialize the MediaPipe Hand Landmarker
async function createHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
    );
    
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
    
    statusText.innerText = "MediaPipe Model Loaded! Ready to track.";
    webcamButton.disabled = false;
}
createHandLandmarker();

// 2. Check for Webcam support & setup Event Listener
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
    webcamButton.addEventListener("click", enableCam);
} else {
    statusText.innerText = "getUserMedia() is not supported by your browser";
}

// 3. Enable Webcam and Start Tracking
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! lambdaLandmarker not loaded yet.");
        return;
    }

    // Hide button once clicked
    webcamButton.style.display = "none";

    const constraints = {
        video: { width: 640, height: 480 }
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

// 4. Real-time Prediction Loop
async function predictWebcam() {
    // Set canvas dimensions to match video stream
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    let startTimeMs = performance.now();
    
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const results = handLandmarker.detectForVideo(video, startTimeMs);

        // Clear canvas for next frame
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw landmarks if detected
        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawHandLandmarks(landmarks);
            }
        }
    }

    // Call this function again on the next animation frame
    window.requestAnimationFrame(predictWebcam);
}

// 5. Custom Canvas Drawing Helper
// (Avoids needing a separate heavy drawing library)
function drawHandLandmarks(landmarks) {
    // MediaPipe Hand connections map (Thumb, Index, Middle, Ring, Pinky, and Palm)
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],       // Index
        [9, 10], [10, 11], [11, 12],          // Middle
        [13, 14], [14, 15], [15, 16],         // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17]             // Knuckle connections
    ];

    // Draw connection lines
    canvasCtx.strokeStyle = "#00e676"; 
    canvasCtx.lineWidth = 3;
    connections.forEach(([start, end]) => {
        const pt1 = landmarks[start];
        const pt2 = landmarks[end];
        if (pt1 && pt2) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(pt1.x * canvasElement.width, pt1.y * canvasElement.height);
            canvasCtx.lineTo(pt2.x * canvasElement.width, pt2.y * canvasElement.height);
            canvasCtx.stroke();
        }
    });

    // Draw joint points
    canvasCtx.fillStyle = "#ff007f"; 
    landmarks.forEach((landmark) => {
        canvasCtx.beginPath();
        canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
        canvasCtx.fill();
    });
}