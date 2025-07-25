let allTickets = [];
let selectedNumbers = [];
let ticketData = [];
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}


const storedTickets = localStorage.getItem("tambolaTickets");
if (storedTickets) {
  ticketData = JSON.parse(storedTickets);
} else {
  ticketData = []; 
}

function saveTicketsToStorage() {
  localStorage.setItem("tambolaTickets", JSON.stringify(ticketData));
}

const createBtn = document.querySelector('.create-btn');
const ticketInput = document.getElementById('ticketInput');
const popupOverlay = document.getElementById('popupOverlay');
const popupGrid = document.getElementById('popupNumberGrid');
const closeBtn = document.getElementById('closePopup');
const bookBtn = document.getElementById('bookSelected');
const popupUsername = document.getElementById('popupUsername');
const bookUserBtn = document.getElementById('bookuser');

const profileIcon = document.getElementById('profileIcon');
const popupMenu = document.getElementById('popupMenu');

profileIcon.addEventListener('click', () => {
  popupMenu.style.display = popupMenu.style.display === 'block' ? 'none' : 'block';
});

window.addEventListener('click', function (e) {
  if (!document.getElementById('proFile').contains(e.target)) {
    popupMenu.style.display = 'none';
  }
});


function generateTicketGrid() {
  const grid = Array.from({ length: 3 }, () => Array(9).fill(0));

  const columns = Array.from({ length: 9 }, (_, i) => {
    const start = i === 0 ? 1 : i * 10;
    const end = i === 8 ? 90 : i * 10 + 9;
    const range = [];
    for (let n = start; n <= end; n++) {
      range.push(n);
    }
    return shuffle(range);
  });

  for (let row = 0; row < 3; row++) {
    const colIndices = shuffle([...Array(9).keys()]).slice(0, 5);
    for (let col of colIndices) {
      if (columns[col].length === 0) continue;
      const number = columns[col].pop(); 
      grid[row][col] = number;
    }
  }

  return grid;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

window.addEventListener("DOMContentLoaded", () => {
  createBtn.addEventListener('click', () => {
    const limit = parseInt(ticketInput.value);
    const datetimeInput = document.querySelector('input[type="datetime-local"]').value;

    if (!datetimeInput) {
      alert("Please select a date and time");
      return;
    }

    if (isNaN(limit) || limit <= 0 || limit > 600) {
      alert("Please enter a valid ticket limit between 1 and 600");
      return;
    }

    const startTime = new Date(datetimeInput).getTime();
    localStorage.setItem("gameStartTime", startTime); 

    allTickets = [];
    for (let i = 1; i <= limit; i++) {
      const ticketGrid = generateTicketGrid();
      allTickets.push({
      serial: i,
      status: 'unsold',
      grid: ticketGrid 
    });
}
    ticketData = allTickets;
    saveTicketsToStorage();
    alert(`${limit} tickets created successfully! Game starts at ${new Date(startTime).toLocaleString()}`);
  });
});

document.addEventListener("DOMContentLoaded", () => {
const openSliderBtn = document.getElementById("openSliderBtn");
const closeSliderBtn = document.getElementById("closeSliderBtn");
const bookingSlider = document.getElementById("bookingSlider");

openSliderBtn.addEventListener("click", () => {
  bookingSlider.classList.add("active");
  loadBookingRequests(); 
});


closeSliderBtn.addEventListener("click", () => {
  bookingSlider.classList.remove("active");
});
})

function loadBookingRequests() {
  const requestList = document.getElementById("requestList");
  requestList.innerHTML = ""; 

  const stored = localStorage.getItem("bookingRequests");
  if (!stored) return;

  const requests = JSON.parse(stored);

  requests.forEach((req, index) => {
    const tickets = req.tickets.join(", ");
    const div = document.createElement("div");
    div.className = "request-box";
    div.setAttribute("data-request-id", index);

    const isAccepted = req.status === "accepted";

    div.innerHTML = `
      <div class="request-info">
        <span class="user-name">${req.name}</span><br />
        <span class="ticket-number">Tickets: ${tickets}</span>
      </div>
      <div class="request-actions">
        <button 
          class="toggle-btn" 
          data-request-index="${index}" 
          data-buyer="${req.name}"
          style="${isAccepted ? 'background-color:red;color:white' : ''}"
        >
          ${isAccepted ? 'Cancel All' : 'Accept All'}
        </button>
      </div>
    `;

    requestList.appendChild(div);
  });

  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const buyer = btn.dataset.buyer;
      const index = parseInt(btn.dataset.requestIndex);

      const stored = localStorage.getItem("bookingRequests");
      if (!stored) return;
      const allRequests = JSON.parse(stored);
      const request = allRequests[index];
      if (!request) return;

      const isAccepted = request.status === "accepted";

      if (!isAccepted) {
        request.tickets.forEach(serial => {
          const ticket = ticketData.find(t => t.serial === serial);
          if (ticket && ticket.status === "unsold") {
            ticket.status = "sold";
            ticket.buyer = buyer;
            ticket.confirmed = true;
          }
        });
        request.status = "accepted";
        btn.textContent = "Cancel All";
        btn.style.backgroundColor = "red";
        btn.style.color = "white";
      } else {
  request.tickets.forEach(serial => {
    const ticket = ticketData.find(t => t.serial === serial);
    if (ticket && ticket.status === "sold" && ticket.buyer === buyer) {
      ticket.status = "unsold";
      ticket.buyer = "";
      ticket.confirmed = false;
    }
  });

  const confirmDelete = confirm(`Do you really want to cancel and remove booking request for ${buyer}?`);
  if (confirmDelete) {
    allRequests.splice(index, 1);  
    requestList.querySelector(`[data-request-id="${index}"]`)?.remove(); 
  } else {
    return;
  }
}

      saveTicketsToStorage();
      localStorage.setItem("bookingRequests", JSON.stringify(allRequests));
      renderTickets?.();
      renderPopupGrid?.();
    });
  });
}

document.getElementById("startGameButton").addEventListener("click", () => {
  const popup = document.createElement("div");
  popup.className = "custom-popup";
  popup.innerHTML = `
      <div class="popup-content">
      <h2>Game Settings</h2>
      <label for="speedInput">Calling Speed (seconds):</label>
      <input type="number" id="speedInput" value="3" min="1" step="1" />
      <br><br>
      <button id="confirmStart">Start Game</button>
      <button class= "close-btn" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
    document.body.appendChild(popup);
  popup.querySelector("#confirmStart").addEventListener("click", () => {
  const speedSeconds = parseInt(document.getElementById("speedInput").value);
  const speedMs = speedSeconds * 1000;

  alert("Game Started");

  setTimeout(() => {
    localStorage.setItem("tambolaSpeed", speedMs);
    localStorage.setItem("confirmStart", "true");

  }, 50);

  popup.remove();
});

})
document.getElementById("resetGameButton").addEventListener("click", () => {
  alert("Game Reset")
  localStorage.setItem("resetTambolaGame", "true");

  setTimeout(() => {
    localStorage.removeItem("resetTambolaGame");
  }, 100);
});

const gameModes = {
  topLine: false,
  middleLine: false,
  bottomLine: false,
  fullHouse: false,
  secondHouse: false,
  quick5: false,
  star: false,
  fullSheet: false,
  halfSheet: false,
};

const savedModes = JSON.parse(localStorage.getItem("tambolaGameModes"));
if (savedModes) {
  Object.assign(gameModes, savedModes);
}

document.querySelectorAll(".toggle-btn").forEach(btn => {
  const mode = btn.dataset.mode;
  btn.textContent = gameModes[mode] ? "ON" : "OFF";
  btn.classList.toggle("active", gameModes[mode]);

  btn.addEventListener("click", () => {
    gameModes[mode] = !gameModes[mode];
    btn.textContent = gameModes[mode] ? "ON" : "OFF";
    btn.classList.toggle("active", gameModes[mode]);
  });
});

document.getElementById("setGameBtn").addEventListener("click", () => {
  localStorage.setItem("tambolaGameModes", JSON.stringify(gameModes));
  alert("Game settings saved!");
});
