import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/+esm";


// ======================================================
// ELEMENTS
// ======================================================

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const flowerCount = document.getElementById("flowerCount");
const clearBtn = document.getElementById("clearBtn");
const boomText = document.getElementById("boomText");


// ======================================================
// VARIABLES
// ======================================================

let handLandmarker = null;

let lastVideoTime = -1;

let flowers = [];
let particles = [];

let lastFlowerTime = [0, 0];
let lastBoom = 0;


// ======================================================
// GESTURE STATE
// ======================================================

// Drawing requires an intentional pointing gesture.
// Moving an open/relaxed hand will NOT create flowers.
// ======================================================
// GESTURE STATE
// ======================================================

const DRAW_HOLD_TIME = 180;

// User must hold fist this long before
// spreading fingers can erase.
const ARM_HOLD_TIME = 700;

// Prevent accidental repeated erase.
const ERASE_COOLDOWN = 900;

const drawStartTime = [0, 0];

// Fist holding state
const fistStartTime = [0, 0];

// Whether the fist has been successfully held
// and the next open palm can trigger erase.
const eraseArmed = [false, false];

let eraseCooldownUntil = 0;

// ======================================================
// CANVAS
// ======================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ======================================================
// INITIALIZE MEDIAPIPE
// ======================================================

async function initializeHandTracking() {

    try {

        statusText.textContent =
            "Loading AI model...";

        console.log(
            "1. Loading MediaPipe..."
        );


        const vision =
            await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
            );


        console.log(
            "2. MediaPipe WASM loaded"
        );


        handLandmarker =
            await HandLandmarker.createFromOptions(
                vision,
                {

                    baseOptions: {

                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

                        delegate: "GPU"

                    },

                    runningMode: "VIDEO",

                    numHands: 2,

                    minHandDetectionConfidence: 0.3,

                    minHandPresenceConfidence: 0.3,

                    minTrackingConfidence: 0.3

                }
            );


        console.log(
            "3. Hand Landmarker created"
        );


        statusText.textContent =
            "Starting camera...";


        await startCamera();

    }

    catch (error) {

        console.error(
            "MEDIA PIPE ERROR:",
            error
        );


        statusText.textContent =
            "AI failed to load";


        statusDot.style.background =
            "#ff4d6d";

    }

}


// ======================================================
// CAMERA
// ======================================================

async function startCamera() {

    try {

        console.log(
            "4. Requesting camera..."
        );


        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    },

                    facingMode: "user"

                },

                audio: false

            });


        console.log(
            "5. Camera permission granted"
        );


        video.srcObject =
            stream;


        video.onloadeddata = () => {

            console.log(
                "6. Camera video loaded"
            );


            statusText.textContent =
                "AI Ready";


            statusDot.style.background =
                "#6dff9b";


            statusDot.style.boxShadow =
                "0 0 12px #6dff9b";


            requestAnimationFrame(
                processVideo
            );

        };


        await video.play();

    }

    catch (error) {

        console.error(
            "CAMERA ERROR:",
            error
        );


        statusText.textContent =
            "Camera permission denied";


        statusDot.style.background =
            "#ff4d6d";

    }

}


// ======================================================
// PROCESS VIDEO
// ======================================================

function processVideo() {

    if (

        video.readyState >= 2 &&

        handLandmarker &&

        video.currentTime !== lastVideoTime

    ) {

        lastVideoTime =
            video.currentTime;


        const results =
            handLandmarker.detectForVideo(

                video,

                performance.now()

            );


        handleHands(results);

    }


    requestAnimationFrame(
        processVideo
    );

}


// ======================================================
// HANDLE HANDS
// ======================================================

// ======================================================
// HANDLE HANDS
// ======================================================

function handleHands(results) {

    // ==================================================
    // NO HAND
    // ==================================================

    if (
        !results.landmarks ||
        results.landmarks.length === 0
    ) {

        statusText.textContent =
            "Show your hand";

        for (let i = 0; i < 2; i++) {

            drawStartTime[i] = 0;
            fistStartTime[i] = 0;
            eraseArmed[i] = false;

        }

        return;
    }


    const numberOfHands =
        results.landmarks.length;

    const now =
        Date.now();


    if (numberOfHands === 1) {

        statusText.textContent =
            "1 hand detected";

    } else {

        statusText.textContent =
            "✨ 2 hands detected ✨";

    }


    // ==================================================
    // PROCESS BOTH HANDS
    // ==================================================

    results.landmarks.forEach(
        (hand, handIndex) => {

            const indexTip =
                hand[8];


            const x =
                (1 - indexTip.x) *
                canvas.width;


            const y =
                indexTip.y *
                canvas.height;


            // ==================================================
            // DETECT GESTURES
            // ==================================================

            const fist =
                isFist(hand);

            const openPalm =
                isOpenPalm(hand);

            const drawingPose =
                isDrawingPose(hand);


            // ==================================================
            // 1. FIST = ARM ERASE
            // ==================================================

            if (fist) {

                // A fist should NOT draw.
                drawStartTime[handIndex] = 0;


                // Start fist timer.
                if (
                    fistStartTime[handIndex] === 0
                ) {

                    fistStartTime[handIndex] =
                        now;

                }


                const fistHeldFor =
                    now -
                    fistStartTime[handIndex];


                // Hold fist long enough.
                if (
                    fistHeldFor >=
                    ARM_HOLD_TIME
                ) {

                    eraseArmed[handIndex] =
                        true;

                }


                // IMPORTANT:
                // Fist alone does NOT erase.
                return;
            }


            // ==================================================
            // 2. OPEN PALM AFTER FIST = ERASE
            // ==================================================

            if (openPalm) {

                // Stop drawing.
                drawStartTime[handIndex] = 0;


                // Only erase if a fist was held first.
                if (
                    eraseArmed[handIndex] &&
                    now >= eraseCooldownUntil
                ) {

                    createExplosion();


                    eraseArmed[handIndex] =
                        false;


                    fistStartTime[handIndex] =
                        0;


                    eraseCooldownUntil =
                        now +
                        ERASE_COOLDOWN;

                }


                // Open palm by itself does nothing.
                return;
            }


            // ==================================================
            // 3. NEUTRAL HAND
            // ==================================================

            /*
                If the user stops making the fist before
                completing the hold, cancel the arming.

                But if eraseArmed is already true, we keep
                it armed until the user spreads their fingers.
            */

            if (
                !eraseArmed[handIndex]
            ) {

                fistStartTime[handIndex] =
                    0;

            }


            // ==================================================
            // 4. DRAWING
            // ==================================================

            if (drawingPose) {

                // Don't draw immediately.
                if (
                    drawStartTime[handIndex] === 0
                ) {

                    drawStartTime[handIndex] =
                        now;

                }


                const heldFor =
                    now -
                    drawStartTime[handIndex];


                if (

                    heldFor >=
                    DRAW_HOLD_TIME &&

                    now -
                    lastFlowerTime[handIndex]
                    >
                    70

                ) {

                    createFlower(
                        x,
                        y
                    );


                    lastFlowerTime[handIndex] =
                        now;

                }


                return;
            }


            // ==================================================
            // 5. NOTHING
            // ==================================================

            /*
                Normal hand movement does NOTHING.
            */

            drawStartTime[handIndex] =
                0;

        }
    );


    // ==================================================
    // RESET UNUSED HANDS
    // ==================================================

    for (
        let i = numberOfHands;
        i < 2;
        i++
    ) {

        drawStartTime[i] = 0;
        fistStartTime[i] = 0;
        eraseArmed[i] = false;

    }

}


// ======================================================
// DISTANCE
// ======================================================

function distance(a, b) {

    return Math.sqrt(

        Math.pow(
            a.x - b.x,
            2
        )

        +

        Math.pow(
            a.y - b.y,
            2
        )

        +

        Math.pow(
            a.z - b.z,
            2
        )

    );

}


// ======================================================
// FIST DETECTION
// ======================================================

function isFist(hand) {

    const wrist =
        hand[0];


    const indexTip =
        hand[8];

    const middleTip =
        hand[12];

    const ringTip =
        hand[16];

    const pinkyTip =
        hand[20];


    const indexMCP =
        hand[5];

    const middleMCP =
        hand[9];

    const ringMCP =
        hand[13];

    const pinkyMCP =
        hand[17];


    const indexFolded =

        distance(
            indexTip,
            wrist
        )

        <

        distance(
            indexMCP,
            wrist
        );


    const middleFolded =

        distance(
            middleTip,
            wrist
        )

        <

        distance(
            middleMCP,
            wrist
        );


    const ringFolded =

        distance(
            ringTip,
            wrist
        )

        <

        distance(
            ringMCP,
            wrist
        );


    const pinkyFolded =

        distance(
            pinkyTip,
            wrist
        )

        <

        distance(
            pinkyMCP,
            wrist
        );


    return (

        indexFolded &&

        middleFolded &&

        ringFolded &&

        pinkyFolded

    );

}


// ======================================================
// DRAWING POSE
// ======================================================

/*
    ONLY THIS HAND POSITION DRAWS:

              ☝️

    Index finger = extended
    Middle finger = folded
    Ring finger = folded
    Pinky = folded

    This prevents normal hand movement
    from creating flowers.
*/

function isDrawingPose(hand) {

    const wrist =
        hand[0];


    const indexTip =
        hand[8];

    const middleTip =
        hand[12];

    const ringTip =
        hand[16];

    const pinkyTip =
        hand[20];


    const indexMCP =
        hand[5];

    const middleMCP =
        hand[9];

    const ringMCP =
        hand[13];

    const pinkyMCP =
        hand[17];


    // INDEX MUST BE EXTENDED
    const indexExtended =

        distance(
            indexTip,
            wrist
        )

        >

        distance(
            indexMCP,
            wrist
        ) * 1.20;


    // OTHER THREE MUST BE FOLDED
    const middleFolded =

        distance(
            middleTip,
            wrist
        )

        <

        distance(
            middleMCP,
            wrist
        ) * 1.15;


    const ringFolded =

        distance(
            ringTip,
            wrist
        )

        <

        distance(
            ringMCP,
            wrist
        ) * 1.15;


    const pinkyFolded =

        distance(
            pinkyTip,
            wrist
        )

        <

        distance(
            pinkyMCP,
            wrist
        ) * 1.15;


    return (

        indexExtended &&

        middleFolded &&

        ringFolded &&

        pinkyFolded

    );

}


// ======================================================
// OPEN / SPREAD PALM DETECTION
// ======================================================
function isOpenPalm(hand) {

    const wrist = hand[0];

    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];

    const indexMCP = hand[5];
    const middleMCP = hand[9];
    const ringMCP = hand[13];
    const pinkyMCP = hand[17];


    const indexExtended =
        distance(indexTip, wrist) >
        distance(indexMCP, wrist) * 1.10;


    const middleExtended =
        distance(middleTip, wrist) >
        distance(middleMCP, wrist) * 1.10;


    const ringExtended =
        distance(ringTip, wrist) >
        distance(ringMCP, wrist) * 1.05;


    const pinkyExtended =
        distance(pinkyTip, wrist) >
        distance(pinkyMCP, wrist) * 1.03;


    const extendedCount =

        Number(indexExtended) +

        Number(middleExtended) +

        Number(ringExtended) +

        Number(pinkyExtended);


    // 3 or 4 fingers extended = spread hand
    return extendedCount >= 3;
}


// ======================================================
// CREATE FLOWER
// ======================================================

function createFlower(x, y) {

    const flowerColors = [

        "#ff75a8",

        "#ff9fc5",

        "#c7a4ff",

        "#8fd8ff",

        "#ffd166",

        "#ff8fab"

    ];


    const flower = {

        x: x,

        y: y,

        size:
            14 +
            Math.random() * 16,

        rotation:
            Math.random() *
            Math.PI,

        color:
            flowerColors[
                Math.floor(
                    Math.random() *
                    flowerColors.length
                )
            ],

        scale: 0,

        alpha: 1,

        removing: false,

        rotationSpeed:
            (
                Math.random() -
                0.5
            ) * 0.02,

        petals:
            5 +
            Math.floor(
                Math.random() * 2
            )

    };


    flowers.push(
        flower
    );


    // ==================================================
    // SPARKLES
    // ==================================================

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        particles.push({

            x:
                x +
                (
                    Math.random() -
                    0.5
                ) * 20,

            y:
                y +
                (
                    Math.random() -
                    0.5
                ) * 20,

            vx:
                (
                    Math.random() -
                    0.5
                ) * 0.7,

            vy:
                (
                    Math.random() -
                    0.5
                ) * 0.7,

            size:
                Math.random() * 2 + 1,

            life: 1,

            color:
                "#ffffff"

        });

    }


    updateFlowerCount();

}


// ======================================================
// DRAW FLOWER
// ======================================================

function drawFlower(flower) {

    ctx.save();


    ctx.globalAlpha =
        flower.alpha ?? 1;


    ctx.translate(
        flower.x,
        flower.y
    );


    ctx.rotate(
        flower.rotation
    );


    ctx.scale(
        flower.scale,
        flower.scale
    );


    // ==================================================
    // GLOW
    // ==================================================

    ctx.shadowBlur =
        25;

    ctx.shadowColor =
        flower.color;


    // ==================================================
    // PETALS
    // ==================================================

    for (
        let i = 0;
        i < flower.petals;
        i++
    ) {

        const angle =
            (
                Math.PI * 2 /
                flower.petals
            ) * i;


        const px =
            Math.cos(angle) *
            flower.size *
            0.7;


        const py =
            Math.sin(angle) *
            flower.size *
            0.7;


        ctx.beginPath();


        ctx.fillStyle =
            flower.color;


        ctx.ellipse(

            px,

            py,

            flower.size *
            0.55,

            flower.size *
            0.35,

            angle,

            0,

            Math.PI * 2

        );


        ctx.fill();

    }


    // ==================================================
    // FLOWER CENTER
    // ==================================================

    ctx.shadowBlur =
        10;


    ctx.beginPath();


    ctx.fillStyle =
        "#ffd166";


    ctx.arc(

        0,

        0,

        flower.size *
        0.3,

        0,

        Math.PI * 2

    );


    ctx.fill();


    ctx.restore();

}


// ======================================================
// EXPLOSION / SMOOTH ERASE
// ======================================================

function createExplosion() {

    if (
        flowers.length === 0
    ) {
        return;
    }


    /*
        Do NOT instantly remove flowers.

        Mark them as "removing".

        updateFlowers()
        will smoothly shrink/fade them.
    */

    flowers.forEach(
        flower => {

            if (
                flower.removing
            ) {
                return;
            }


            flower.removing =
                true;


            // Explosion particles
            for (
                let i = 0;
                i < 15;
                i++
            ) {

                const angle =
                    Math.random() *
                    Math.PI *
                    2;


                const speed =
                    2 +
                    Math.random() * 6;


                particles.push({

                    x:
                        flower.x,

                    y:
                        flower.y,

                    vx:
                        Math.cos(angle) *
                        speed,

                    vy:
                        Math.sin(angle) *
                        speed,

                    size:
                        2 +
                        Math.random() * 5,

                    life: 1,

                    color:
                        flower.color

                });

            }

        }
    );


    updateFlowerCount();

}


// ======================================================
// UPDATE PARTICLES
// ======================================================

function updateParticles() {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx;


            particle.y +=
                particle.vy;


            particle.vx *=
                0.98;


            particle.vy *=
                0.98;


            particle.vy +=
                0.03;


            particle.life -=
                0.025;

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );

}


// ======================================================
// DRAW PARTICLES
// ======================================================

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();


            ctx.globalAlpha =
                particle.life;


            ctx.shadowBlur =
                15;


            ctx.shadowColor =
                particle.color;


            ctx.fillStyle =
                particle.color;


            ctx.beginPath();


            ctx.arc(

                particle.x,

                particle.y,

                particle.size,

                0,

                Math.PI * 2

            );


            ctx.fill();


            ctx.restore();

        }
    );

}


// ======================================================
// UPDATE FLOWERS
// ======================================================

function updateFlowers() {

    flowers.forEach(
        flower => {

            // Normal flower
            if (
                !flower.removing
            ) {

                if (
                    flower.scale < 1
                ) {

                    flower.scale +=
                        0.08;

                }


                flower.rotation +=
                    flower.rotationSpeed;


                return;

            }


            // ==================================================
            // SMOOTH DISAPPEARING
            // ==================================================

            flower.scale *=
                0.82;


            flower.alpha *=
                0.82;


            flower.rotation +=
                flower.rotationSpeed *
                2;

        }
    );


    const oldLength =
        flowers.length;


    flowers =
        flowers.filter(

            flower =>

                !flower.removing ||

                flower.alpha > 0.03

        );


    if (
        flowers.length !==
        oldLength
    ) {

        updateFlowerCount();

    }

}


// ======================================================
// ANIMATION LOOP
// ======================================================

function animate() {

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );


    updateFlowers();

    updateParticles();


    flowers.forEach(
        drawFlower
    );


    drawParticles();


    requestAnimationFrame(
        animate
    );

}


animate();


// ======================================================
// CLEAR BUTTON
// ======================================================

clearBtn.addEventListener(
    "click",
    () => {

        flowers = [];

        particles = [];


        drawStartTime[0] = 0;
        drawStartTime[1] = 0;


        eraseStartTime[0] = 0;
        eraseStartTime[1] = 0;


        eraseTriggered[0] = false;
        eraseTriggered[1] = false;


        eraseCooldownUntil =
            Date.now() + 500;


        updateFlowerCount();

    }
);


// ======================================================
// FLOWER COUNT
// ======================================================

function updateFlowerCount() {

    flowerCount.textContent =
        flowers.length;

}


// ======================================================
// START
// ======================================================

initializeHandTracking();