# 🌸 BloomAir — Gesture Controlled Flower Canvas

BloomAir is an interactive computer-vision project that allows users to create a virtual flower garden using hand gestures.

Move your fingers in front of the webcam and watch flowers bloom on the screen. Make a fist to trigger a particle explosion that makes the flowers disappear.

The project combines **HTML, CSS, JavaScript, Canvas API, and MediaPipe Hand Landmarker** to create a real-time gesture-controlled visual experience.

## ✨ Features

* 🖐️ Real-time hand detection using the webcam
* ☝️ Index-finger controlled flower creation
* 🌸 Animated flowers with glowing petals
* 🖐️ Support for detecting up to two hands
* ✊ Fist gesture to clear the flower garden
* 💥 Particle-based flower explosion effect
* ✨ Glowing visual effects
* 📷 Live webcam background
* 🔄 Clear Garden button
* 📊 Live flower counter
* 📱 Responsive interface

## 🎮 Gesture Controls

| Gesture          | Action                         |
| ---------------- | ------------------------------ |
| ☝️ Index finger  | Create flowers                 |
| 🖐️ Open hand    | Move around the canvas         |
| ✊ Fist           | Make all flowers disappear     |
| 🖐️🖐️ Two hands | Create flowers with both hands |

## 🛠️ Technologies Used

* **HTML5**
* **CSS3**
* **JavaScript**
* **Canvas API**
* **MediaPipe Tasks Vision**
* **WebRTC / getUserMedia API**

## 🧠 How It Works

The webcam captures the user's hand movements in real time.

MediaPipe Hand Landmarker detects hand landmarks and provides the coordinates of important points on the hand.

The application uses the index-finger tip to determine where flowers should appear.

```text
Webcam
   ↓
MediaPipe Hand Detection
   ↓
Hand Landmarks
   ↓
Index Finger Position
   ↓
Canvas Coordinates
   ↓
🌸 Flowers
```

When a fist is detected:

```text
✊ Fist
   ↓
Gesture Detection
   ↓
Flower Garden
   ↓
✨ Particle Explosion
   ↓
Flowers Disappear
```

## 📁 Project Structure

```text
BloomAir/
│
├── index.html       # Main application interface
├── style.css        # Styling and visual effects
├── script.js        # Hand tracking and animation logic
└── README.md        # Project documentation
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/BloomAir-Gesture-Canvas.git
```

### 2. Open the project

```bash
cd BloomAir-Gesture-Canvas
```

### 3. Run with a local server

Because the project uses webcam access and JavaScript modules, it should be served through a local web server rather than opened directly with `file://`.

If you use VS Code, install the **Live Server** extension and open `index.html` with Live Server.

You can also use Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### 4. Allow camera access

When the browser asks for camera permission, click **Allow**.

## ⚠️ Browser Permissions

BloomAir requires access to the user's webcam.

Camera access may not work if `index.html` is opened directly using:

```text
file:///...
```

Use a local server such as:

```text
http://localhost:8000
```

or VS Code Live Server.

## 🎨 Future Improvements

* 🌹 Different flower types
* 🌻 Sunflowers and roses
* 🎨 Gesture-controlled flower colors
* 🦋 Animated butterflies
* 🌱 Growing stems and leaves
* 🎵 Interactive sound effects
* ✨ More realistic particle physics
* 📹 Built-in screen recording
* ❤️ Heart gesture interactions
* 🤏 Additional gesture controls
* 🌐 Deploy as a public interactive web experience

## 📌 Project Purpose

BloomAir was created as an exploration of **computer vision, hand tracking, browser APIs, and creative coding**.

The goal is to combine technology and visual interaction into an engaging user experience.

## 👩‍💻 Author

**Arpitha**


---

⭐ If you like the project, consider giving the repository a star!
