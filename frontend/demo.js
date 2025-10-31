// === ELEMENTS ===
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyzeBtn");
const micBtn = document.getElementById("micBtn");
const transcriptEl = document.getElementById("transcript");
const diseaseName = document.getElementById("diseaseName");
const confidence = document.getElementById("confidence");
const solution = document.getElementById("solution");
const progress = document.getElementById("progress");
const weatherInfo = document.getElementById("weatherInfo");
const map = document.getElementById("map");
const loadingBar = document.getElementById("loadingBar");

// === IMAGE PREVIEW ===
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    preview.src = ev.target.result;
    preview.style.display = "block";
    preview.classList.add("fade-in");
  };
  reader.readAsDataURL(file);
});

// === SPEECH RECORDING & TRANSLATION ===
let mediaRecorder;
let chunks = [];

micBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    transcriptEl.textContent = "🎙 Recording... (Speak now)";
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      transcriptEl.textContent = "🔄 Processing speech...";

      try {
        const res = await fetch("http://127.0.0.1:5000/speech", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.text) {
          // Translate automatically to English
          const translated = await translateToEnglish(data.text);
          transcriptEl.textContent = `🗣 ${translated}`;
        } else {
          transcriptEl.textContent = "⚠️ Could not recognize speech.";
        }
      } catch (err) {
        console.error("Speech recognition error:", err);
        transcriptEl.textContent = "❌ Speech recognition failed.";
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      if (mediaRecorder.state === "recording") mediaRecorder.stop();
    }, 4000); // record for 4 seconds
  } catch (err) {
    console.error("Mic access error:", err);
    transcriptEl.textContent = "❌ Please allow microphone access.";
  }
});

// === TRANSLATION FUNCTION ===
async function translateToEnglish(text) {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target: "en", format: "text" })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
}

// === AI DISEASE DETECTION ===
analyzeBtn.addEventListener("click", async () => {
  if (!fileInput.files[0]) return alert("Please upload an image first!");

  analyzeBtn.disabled = true;
  loadingBar.style.display = "block";
  diseaseName.textContent = "";
  confidence.textContent = "";
  solution.textContent = "";

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);
  formData.append("concern", transcriptEl.textContent || "");

  try {
    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to reach backend server.");
    const data = await res.json();

    diseaseName.textContent = data.disease;
    confidence.textContent = `${data.confidence}%`;
    solution.textContent = data.solution;
    progress.style.width = `${data.confidence}%`;
  } catch (err) {
    alert("❌ Error analyzing image: " + err.message);
    console.error(err);
  } finally {
    analyzeBtn.disabled = false;
    loadingBar.style.display = "none";
  }
});

// === WEATHER + MAP ===
function getWeather(lat, lon) {
  const key = ""; // Optional OpenWeather API key
  if (key) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    )
      .then(res => res.json())
      .then(d => {
        weatherInfo.textContent = `🌡 ${d.main.temp}°C, ${d.weather[0].description}, Humidity ${d.main.humidity}%`;
      })
      .catch(() => (weatherInfo.textContent = "⚠️ Weather fetch failed."));
  } else {
    weatherInfo.textContent = "🌤 27°C, Partly cloudy, Humidity 65% (Mock Data)";
  }

  map.src = `https://www.google.com/maps?q=${lat},${lon}&z=10&output=embed`;
}

// === LOCATION ===
function askLocation() {
  if (navigator.geolocation) {
    weatherInfo.textContent = "📍 Requesting location...";
    navigator.geolocation.getCurrentPosition(
      pos => {
        weatherInfo.textContent = "📍 Location granted. Fetching weather...";
        getWeather(pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        console.warn("Location error:", err);
        weatherInfo.innerHTML = `❌ Location denied. <button id="retryLocation" style="color:#4CAF50;">Try Again</button>`;
        document
          .getElementById("retryLocation")
          .addEventListener("click", askLocation);
      },
      { timeout: 5000 }
    );
  } else {
    weatherInfo.textContent = "❌ Geolocation not supported by your browser.";
  }
}

askLocation();
