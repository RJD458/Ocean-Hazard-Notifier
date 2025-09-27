let currentCoords = null;
let reports = [];
let heatPoints = [];

// Init Map
const map = L.map('map').setView([20.5937, 78.9629], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const heatLayer = L.heatLayer(heatPoints, { radius: 25 }).addTo(map);

// Get Location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    currentCoords = [pos.coords.latitude, pos.coords.longitude];
  });
}





// Location Fetch Function
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentCoords = [pos.coords.latitude, pos.coords.longitude];
        document.getElementById("locationField").value =
          `Lat: ${pos.coords.latitude.toFixed(6)}, Lon: ${pos.coords.longitude.toFixed(6)}`;
          // Enable submit button once location is set
                const btn = document.getElementById("submitBtn");
                btn.disabled = false;
                btn.style.cursor = "pointer";
                btn.style.background = "#0077cc";
      },
      () => {
        alert("Unable to fetch location. Please enable GPS.");
      }
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }
}








function updateStats() {
  document.getElementById("totalReports").textContent = reports.length;
  document.getElementById("highWaveCount").textContent = reports.filter(r => r.type === "High Wave").length;
  document.getElementById("stormSurgeCount").textContent = reports.filter(r => r.type === "Storm Surge").length;
  document.getElementById("tsunamiCount").textContent = reports.filter(r => r.type === "Tsunami").length;
  document.getElementById("floodingCount").textContent = reports.filter(r => r.type === "Flooding").length;
}










// Render Reports
function renderReports(filterType) {
  const reportList = document.getElementById("reportList");
  reportList.innerHTML = "";

  reports
    .filter(r => filterType === "all" || r.type === filterType)
    .forEach(r => {
      const reportDiv = document.createElement("div");
      reportDiv.className = "report-card";
      reportDiv.innerHTML = `
        <h4>${r.type}</h4>
        <p>${r.desc}</p>
        <p><strong>Location:</strong> Lat ${r.lat.toFixed(4)}, Lon ${r.lon.toFixed(4)}</p>
        <p><em>${r.time || "Just now"}</em></p>
      `;

      if (r.img) {
        const imgEl = document.createElement("img");
        imgEl.src = URL.createObjectURL(r.img);
        reportDiv.appendChild(imgEl);
      }
      if (r.vid) {
        const vidEl = document.createElement("video");
        vidEl.src = URL.createObjectURL(r.vid);
        vidEl.controls = true;
        reportDiv.appendChild(vidEl);
      }
      reportList.appendChild(reportDiv);
    });
}


// Filter Reports
function filterReports() {
    const filterValue = document.getElementById("filterSelect").value;
    renderReports(filterValue);
}






// Page Switcher
function showPage(pageId) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.getElementById(pageId).style.display = "block";

  // 👇 Fix map rendering if dashboard is opened
  if (pageId === "dashboardPage") {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }

  // ✅ Auto-reset form every time report page is opened
  if (pageId === "reportPage") {
    const form = document.getElementById("reportForm");
    if (form) form.reset();

    const btn = document.getElementById("submitBtn");

    // 👇 NEW LOGIC
    if (currentCoords) {
      // Reuse last location
      document.getElementById("locationField").value =
        `Lat: ${currentCoords[0].toFixed(6)}, Lon: ${currentCoords[1].toFixed(6)}`;
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.background = "#0077cc";
    } else {
      // Ask for fresh location
      document.getElementById("locationField").value = "";
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.style.background = "#888";
    }
  }
}









function showToast(message) {
  let toast = document.createElement("div");
  toast.className = "toast show";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}








function addReport(report) {
  reports.unshift(report);

  // Add marker
  L.marker([report.lat, report.lon])
    .addTo(map)
    .bindPopup(`<b>${report.type}</b><br>${report.desc}`);

  // Update heatmap
  heatPoints.push([report.lat, report.lon, 1]);
  heatLayer.setLatLngs(heatPoints);

  // Refresh dashboard
  renderReports("all");
  updateStats();
  if (typeof updateChart === "function") updateChart(); // safe check
}





// Report Form Submit
document.getElementById("reportForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const type = document.getElementById("eventType").value;
  const desc = document.getElementById("desc").value;
  const img = document.getElementById("imageUpload").files[0];
  const vid = document.getElementById("videoUpload").files[0];

  if (!currentCoords) {
    showToast("⚠️ Please fetch your location before submitting.");
    return;
  }

  const [lat, lon] = currentCoords;
  const newReport = {
    type,
    desc,
    lat,
    lon,
    img,
    vid,
    time: new Date().toLocaleString()
  };

  // Save report
  addReport(newReport);

  // Show success
  showToast("✅ Report submitted successfully!");

  // Reset form completely
  const form = document.getElementById("reportForm");
  form.reset();
  currentCoords = null;
  document.getElementById("locationField").value = "";

  // Disable submit until new location is fetched again
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.style.cursor = "not-allowed";
  btn.style.background = "#888";

});





















// Toggle between Login and Signup
function toggleAuth() {
  const loginBox = document.getElementById("loginBox");
  const signupBox = document.getElementById("signupBox");

  if (loginBox.style.display === "none") {
    loginBox.style.display = "block";
    signupBox.style.display = "none";
  } else {
    loginBox.style.display = "none";
    signupBox.style.display = "block";
  }
}













// Mock User Storage (localStorage)
let users = JSON.parse(localStorage.getItem("users")) || [];

























// Sign Up
document.getElementById("signupForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  if (users.find(u => u.email === email)) {
    alert("User already exists! Please login.");
    return;
  }

  users.push({ name, email, password, role });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Sign Up successful! Please login.");
  toggleAuth();
});































// Login
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("loginRole").value;

  const user = users.find(u => u.email === email && u.password === password && u.role === role);

  if (user) {
    alert(`Welcome ${user.name}! Logged in as ${role}.`);
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html"; // redirect to home/dashboard
  } else {
    alert("Invalid credentials or role. Try again.");
  }
});





































// Queries
function submitQuery() {
  const q = document.getElementById("queryInput").value.toLowerCase().trim();
  const respBox = document.getElementById("queryResponse");
  let resp = "⚠️ Please follow official advisories and stay updated with INCOIS alerts.";

  if (q.includes("wave")) {
    resp = "🌊 High Waves Advisory: Stay away from beaches and avoid water activities.";
  } else if (q.includes("tsunami")) {
    resp = "🌊 Tsunami Alert: Move to higher ground immediately and follow evacuation routes.";
  } else if (q.includes("flood")) {
    resp = "💧 Flood Safety: Avoid low-lying areas, switch off electricity, and move valuables upstairs.";
  } else if (q.includes("cyclone")) {
    resp = "🌪️ Cyclone Warning: Stay indoors, secure loose objects, and stock emergency supplies.";
  } else if (q.includes("storm surge")) {
    resp = "🌊 Storm Surge Risk: Evacuate coastal areas and do not attempt to cross flooded roads.";
  }

  respBox.style.display = "block"; // ensure box is visible
  respBox.textContent = resp;
}



















// 👇 ADDED: functions for Register / Sign up
  function showRegister(){
    document.getElementById('registerBox').style.display = 'block';
  }
  function hideRegister(){
    document.getElementById('registerBox').style.display = 'none';
  }

  function googleSignUp(){
    alert('Google Sign up simulated (frontend only)');
    hideRegister();
  }

  function manualSignUp(){
    const name=document.getElementById('reg_name').value;
    const phone=document.getElementById('reg_phone').value;
    const pass=document.getElementById('reg_pass').value;
    if(name && pass){
      alert('User '+name+' registered (local simulation)');
      hideRegister();
    } else {
      alert('Please fill all required fields');
    }
  }
  // 👆 END ADDED
