let selectedNumbers = [];
let ticketData = [];
const gameWarning = document.getElementById("noticeoverlay")
const button = document.getElementById("acceptt")
 if (localStorage.getItem("noticeAccepted") === "true") {
  gameWarning.style.display = "none";
}
button.addEventListener("click", function () {
  gameWarning.style.display="none";
  localStorage.setItem("noticeAccepted", "true")
})
// user login
const loginBtn = document.getElementById("loginBtn");
const loginPage = document.getElementById("loginPage");
const closeBtn = document.querySelector(".loginpage .close");
const loginForm = loginPage.querySelector("form");
const staticUsername = "admin";
const staticPassword = "1234";

loginBtn.addEventListener("click", () => {
  loginPage.classList.add("active");
});

closeBtn.addEventListener("click", () => {
  loginPage.classList.remove("active");
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = loginForm.querySelector("input[type='text']").value.trim();
  const password = loginForm.querySelector("input[type='password']").value.trim();

  if (username === staticUsername && password === staticPassword) {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "adminPanel.html";
  } else {
    alert("Incorrect username or password.");
  }
});


// -------------------
const activeGameModes = JSON.parse(localStorage.getItem("tambolaGameModes") || '{}');
const popupOverlay = document.getElementById("popupOverlay");
const popupUsername = document.getElementById("popupUsername");
const popupGrid = document.getElementById("popupNumberGrid");
const gameplayArea = document.getElementById("gameplayArea");
const ticketSection = document.getElementById("ticketSection");

const storedTickets = localStorage.getItem("tambolaTickets");
ticketData = storedTickets ? JSON.parse(storedTickets) : [];

function saveTicketsToStorage() {
  localStorage.setItem("tambolaTickets", JSON.stringify(ticketData));
}

function loadTicketsFromStorage() {
  const stored = localStorage.getItem("tambolaTickets");
  ticketData = stored ? JSON.parse(stored) : [];
}

function renderGrid(grid) {
  if (!grid || grid.length !== 3) return '<div class="ticket">Invalid Grid</div>';

  let html = '<div class="ticket">';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      const num = grid[r][c];
      html += `<div class="cell" data-number="${num}">${num > 0 ? num : ''}</div>`;
    }
  }
  html += '</div>';
  return html;
}

function renderTickets() {
  const ticketList = document.getElementById("ticketList");
  ticketList.innerHTML = "";

  ticketData.forEach(ticket => {
    const label = ticket.status === "unsold" ? "unsold" : (ticket.buyer || ticket.status);
    const ticketDiv = document.createElement("div");
    ticketDiv.className = "ticket-box";
    ticketDiv.innerHTML = `
      <div class="ticket-name">${ticket.serial}: (${label})</div>
      <div class="ticket-grid">${renderGrid(ticket.grid)}</div>
    `;
    ticketList.appendChild(ticketDiv);
  });
}

function openPopup() {
  selectedNumbers = [];
  popupUsername.value = "";
  popupOverlay.style.display = "flex";
  renderPopupGrid();
}

function closePopup() {
  popupOverlay.style.display = "none";
  selectedNumbers = [];
}

function renderPopupGrid() {
  popupGrid.innerHTML = "";

  ticketData.forEach(ticket => {
    const cell = document.createElement("div");
    cell.textContent = ticket.serial;

    if (ticket.status === "sold" && ticket.confirmed) {
      cell.classList.add("booked");
      cell.title = `Booked by ${ticket.buyer}`;
    } else {
      cell.addEventListener("click", () => {
        if (selectedNumbers.includes(ticket.serial)) {
          selectedNumbers = selectedNumbers.filter(n => n !== ticket.serial);
          cell.classList.remove("selected");
        } else {
          selectedNumbers.push(ticket.serial);
          cell.classList.add("selected");
        }
      });
    }
    popupGrid.appendChild(cell);
  });
}

function saveBookingRequest(username, numbers) {
  const stored = localStorage.getItem("bookingRequests");
  const requests = stored ? JSON.parse(stored) : [];
  const sheetId = 'sheet-' + Date.now();

  requests.push({ 
    name: username, 
    tickets: numbers,
    status: "pending", 
    sheetId: sheetId 
  });

  localStorage.setItem("bookingRequests", JSON.stringify(requests));
}




function bookSelectedTickets() {
  const name = popupUsername.value.trim();
  if (!name) return alert("Please enter your name.");
  if (selectedNumbers.length === 0) return alert("Select at least one ticket.");

  const availableNumbers = selectedNumbers.filter(num => {
    const ticket = ticketData.find(t => t.serial === num);
    return ticket && ticket.status === "unsold";
  });

  if (availableNumbers.length === 0) {
    alert("All selected tickets are already booked!");
    return;
  }

  saveBookingRequest(name, selectedNumbers);
  const message = `I want to book these tickets: ${selectedNumbers.join(', ')}\nName: ${name}`;
  window.open(`https://wa.me/919707383843?text=${encodeURIComponent(message)}`, '_blank');
  closePopup();
}

function startCountdown() {
  const days = document.getElementById("days");
  const hours = document.getElementById("hours");
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");
  const startTimeDisplay = document.getElementById("startTimeDisplay");

  const storedTime = localStorage.getItem("gameStartTime");
  if (!storedTime) {
    startTimeDisplay.textContent = "Start time not set.";
    return;
  }

  const target = Number(storedTime);
  startTimeDisplay.innerHTML = `GAME WILL START AT: <strong>${new Date(target).toLocaleString()}</strong>`;

  const interval = setInterval(() => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(interval);
      days.innerText = hours.innerText = minutes.innerText = seconds.innerText = "00";
      startTimeDisplay.innerHTML = `GAME STARTED`;
      return;
    }

    days.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    hours.innerText = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    minutes.innerText = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
    seconds.innerText = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
  }, 1000);
}

function highlightCalledNumbers(scope = document) {
  const called = JSON.parse(localStorage.getItem("tambolaCalledNumbers")) || [];
  const cells = scope.querySelectorAll('.cell');

  cells.forEach(cell => {
    const number = parseInt(cell.dataset.number);
    if (called.includes(number)) {
      cell.style.backgroundColor = 'red';
      cell.style.color = 'white';
    }
  });
}


function setupCallerSystem() {
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  let remaining = [...allNumbers];
  let called = [];
  let autoCaller;

  const board = document.getElementById("callerBoard");
  const lastCalled = document.getElementById("lastCalledNumber");
  const roundDisplay = document.getElementById("roundNumberDisplay");

  allNumbers.forEach(n => {
    const div = document.createElement("div");
    div.textContent = n;
    div.id = `num-${n}`;
    board.appendChild(div);
  });

  function speakNumber(num) {
    const msg = new SpeechSynthesisUtterance(`Number ${num}`);
    window.speechSynthesis.speak(msg);
  }
  function checkAllWinnersDeclared() {
  const winners = JSON.parse(localStorage.getItem("tambolaWinners") || "{}");
  const activeGameModes = JSON.parse(localStorage.getItem("tambolaGameModes") || "{}");

  return Object.entries(activeGameModes)
    .filter(([_, enabled]) => enabled)
    .every(([mode]) => winners[mode]);
}
  function stopNumberCaller() {
      clearInterval(autoCaller); // Stop the number calling loop
    console.log("Number calling stopped – All winners declared.");

    const lastCalled = document.getElementById("lastCalledNumber");
    const roundDisplay = document.getElementById("roundNumberDisplay");

    if (lastCalled) lastCalled.textContent = "GAME IS OVER";
    if (roundDisplay) roundDisplay.textContent = "GAME OVER";

}

  function callNextNumber() {
    roundDisplay.style.display = "flex";

    if (remaining.length === 0) {
      clearInterval(autoCaller);
      lastCalled.textContent = "GAME IS OVER";
      roundDisplay.textContent = "GAME OVER";
      return;
    }

    const index = Math.floor(Math.random() * remaining.length);
    const num = remaining.splice(index, 1)[0];
    called.push(num);

    lastCalled.textContent = num;
    roundDisplay.textContent = num;
    document.getElementById(`num-${num}`)?.classList.add("called");

    roundDisplay.classList.remove("animate");
    void roundDisplay.offsetWidth;
    roundDisplay.classList.add("animate");

    speakNumber(num);
    localStorage.setItem("tambolaCalledNumbers", JSON.stringify(called));
    checkAndUpdateWinners();
    highlightCalledNumbers();

    // Stop if all winners are declared
    if (checkAllWinnersDeclared()) {
      stopNumberCaller();
    }

  }

  // Load state
  const saved = JSON.parse(localStorage.getItem("tambolaCalledNumbers") || "[]");
  called = saved;
  remaining = allNumbers.filter(n => !called.includes(n));

  called.forEach(num => {
    document.getElementById(`num-${num}`)?.classList.add("called");
  });

  if (called.length > 0) {
    const lastNum = called[called.length - 1];
    lastCalled.textContent = lastNum;
    roundDisplay.textContent = lastNum;
    roundDisplay.style.display = "flex";
  }

  if (localStorage.getItem("confirmStart") === "true" && remaining.length > 0) {
    gameplayArea.style.display = "block";
    roundDisplay.style.display = "flex";
    const speed = parseInt(localStorage.getItem("tambolaSpeed") || "3000");
    autoCaller = setInterval(callNextNumber, speed);
  }

  // ✅ Search ticket and show result
window.showBookingAndTickets = function (ticketNumber) {
  const bookingRequests = JSON.parse(localStorage.getItem("bookingRequests")) || [];
  const allTickets = JSON.parse(localStorage.getItem("tambolaTickets")) || [];

  const request = bookingRequests.find(r => r.tickets.includes(Number(ticketNumber)));
  const display = document.getElementById("resultDisplay");
  display.innerHTML = "";

  if (!request) {
    display.textContent = "No booking found.";
    return;
  }

  // Show user info
  const userInfo = document.createElement("div");
  userInfo.innerHTML = `
    <strong>Name:</strong> ${request.name}<br>
    <strong>Tickets:</strong> ${request.tickets.join(", ")}<br>
    <strong>Status:</strong> ${request.status}<br><br>
  `;
  display.appendChild(userInfo);

  // Show user's tickets
  request.tickets.forEach(serial => {
    const ticketObj = allTickets.find(t => Number(t.serial) === Number(serial));
    if (!ticketObj) return;

    const ticketHTML = renderGrid(ticketObj.grid);

    const wrapper = document.createElement("div");
    wrapper.className = "ticket-box";
    wrapper.innerHTML = `
      <div class="ticket-name">${ticketObj.serial}: (${ticketObj.buyer || "sold"})</div>
      <div class="ticket-grid">${ticketHTML}</div>
    `;

    display.appendChild(wrapper);
    highlightCalledNumbers(wrapper); // ✅ Re-apply highlights
  });
};


  // Listen for admin panel broadcast
  window.addEventListener("storage", (e) => {
    if (e.key === "confirmStart" && e.newValue === "true") {
      gameplayArea.style.display = "block";
      ticketSection.style.display = "block";
      if (!autoCaller && remaining.length > 0) {
        callNextNumber();
        const speed = parseInt(localStorage.getItem("tambolaSpeed") || "3000");
        autoCaller = setInterval(callNextNumber, speed);
      }
    }

    if (e.key === "resetTambolaGame" && e.newValue === "true") {
      clearInterval(autoCaller);
      autoCaller = null;
      called = [];
      remaining = [...allNumbers];

      roundDisplay.textContent = "";
      roundDisplay.style.display = "none";
      lastCalled.textContent = "";

      allNumbers.forEach(n => {
        document.getElementById(`num-${n}`)?.classList.remove("called");
      });

      document.querySelectorAll('#ticketList .cell').forEach(cell => {
        cell.style.backgroundColor = '';
        cell.style.color = '';
      });

      gameplayArea.style.display = "none";
      ticketSection.style.display = "block";

      localStorage.removeItem("confirmStart");
      localStorage.removeItem("tambolaCalledNumbers");
      localStorage.removeItem("resetTambolaGame");
      localStorage.removeItem("tambolaWinners");

    }
  });
}


function checkAndUpdateWinners() {
  const calledNumbers = JSON.parse(localStorage.getItem("tambolaCalledNumbers") || "[]");
  const winners = JSON.parse(localStorage.getItem("tambolaWinners") || "{}");
  const tickets = JSON.parse(localStorage.getItem("tambolaTickets") || "[]");
  const requests = JSON.parse(localStorage.getItem("bookingRequests") || "[]");

  if (calledNumbers.length > 0 && requests.length === 0) {
    const winnerSections = [
      "quick5", "fullHouse", "secondHouse", "topLine", "middleLine", "bottomLine",
      "star", "fullSheet", "halfSheet", "fullSheetBonus"
    ];

    winnerSections.forEach(id => {
      const ul = document.querySelector(`#${id} ul`);
      if (ul && ul.children.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Unbooked";
        li.classList.add("unbooked");
        ul.appendChild(li);
      }
    });

    return;
  }

  const userTickets = {};
  const alreadyClaimed = new Set(Object.values(winners).map(w => typeof w === 'object' ? w.name : w));
  const fullHouseTickets = new Set();
  let secondFullHouseAwarded = !!winners.secondFullHouse;

  function addWinner(id, name, tickets = [], label = "") {
    const ul = document.querySelector(`#${id} ul`);
    if (!ul) return;

    const li = document.createElement("li");
    const ticketStr = tickets.length ? ` [${tickets.join(", ")}]` : "";
    li.textContent = label ? `${label} – ${name}${ticketStr}` : `${name}${ticketStr}`;

    if (id === "fullSheetBonus") {
      li.classList.add("bonus-winner");
    }

    ul.appendChild(li);
  }

  // Group tickets by user
  requests.forEach(r => {
    if (!userTickets[r.name]) userTickets[r.name] = [];
    userTickets[r.name].push(...r.tickets);
  });

  for (const user in userTickets) {
    const ticketSerials = userTickets[user];
    let ticketsWith2Marked = 0;

    for (const serial of ticketSerials) {
      const ticket = tickets.find(t => t.serial == serial);
      if (!ticket) continue;

      const grid = ticket.grid;
      const flatNumbers = grid.flat().filter(n => n > 0);
      const matched = flatNumbers.filter(n => calledNumbers.includes(n));

      // Quick 5
      if (activeGameModes.quick5 && !winners.quick5 && matched.length >= 5) {
      winners.quick5 = { name: user, tickets: ticketSerials };
      addWinner("quick5", user, ticketSerials, "Quick 5");
    }

      // Full House
      if (matched.length === 15) {
        if (!winners.fullHouse) {
          winners.fullHouse = { name: user, tickets: [serial] };
          fullHouseTickets.add(serial);
          addWinner("fullHouse", user, [serial], "Full House");
        } else if (!secondFullHouseAwarded && !winners.secondFullHouse && !fullHouseTickets.has(serial)) {
          winners.secondFullHouse = { name: user, tickets: [serial] };
          secondFullHouseAwarded = true;
          addWinner("secondHouse", user, [serial], "Second Full House");
        }
      }

      // Top / Middle / Bottom Line
      for (let r = 0; r < 3; r++) {
        const row = grid[r].filter(n => n > 0);
        const matchedRow = row.filter(n => calledNumbers.includes(n));

        if (r === 0 && matchedRow.length === row.length && !winners.topLine) {
          winners.topLine = { name: user, tickets: ticketSerials };
          addWinner("topLine", user, ticketSerials, "Top Line");
        }
        if (r === 1 && matchedRow.length === row.length && !winners.middleLine) {
          winners.middleLine = { name: user, tickets: ticketSerials };
          addWinner("middleLine", user, ticketSerials, "Middle Line");
        }
        if (r === 2 && matchedRow.length === row.length && !winners.bottomLine) {
          winners.bottomLine = { name: user, tickets: ticketSerials };
          addWinner("bottomLine", user, ticketSerials, "Bottom Line");
        }
      }

      // Star Pattern
      const starNumbers = [grid[0][0], grid[0][8], grid[2][0], grid[2][8], grid[1][2]];
      if (!winners.star && starNumbers.every(n => n > 0 && calledNumbers.includes(n))) {
        winners.star = { name: user, tickets: ticketSerials };
        addWinner("star", user, ticketSerials, "Star");
      }

      if (matched.length >= 2) ticketsWith2Marked++;
    }

    // Full Sheet
    if (ticketSerials.length === 6 && ticketsWith2Marked === 6 && !winners.fullSheet) {
      winners.fullSheet = { name: user, tickets: ticketSerials };
      addWinner("fullSheet", user, ticketSerials, "Full Sheet");
    }

    // ✅ Full Sheet Bonus (after someone else already won Full Sheet)
    if (
      ticketSerials.length === 6 &&
      winners.fullSheet &&
      winners.fullSheet.name !== user &&
      !winners.fullSheetBonus
    ) {
      const first3 = ticketSerials.slice(0, 3);
      const last3 = ticketSerials.slice(3, 6);

      const countMarked = serials => {
        return serials.filter(serial => {
          const ticket = tickets.find(t => t.serial == serial);
          if (!ticket) return false;
          const flat = ticket.grid.flat().filter(n => n > 0);
          const matched = flat.filter(n => calledNumbers.includes(n));
          return matched.length >= 2;
        }).length;
      };

      const first3Marked = countMarked(first3);
      const last3Marked = countMarked(last3);

      if (first3Marked === 3 || last3Marked === 3) {
        winners.fullSheetBonus = { name: user, tickets: ticketSerials };
        addWinner("fullSheetBonus", user, ticketSerials, "Full Sheet Bonus");
      }
    }


    // Half Sheet
    if (ticketSerials.length === 3 && ticketsWith2Marked === 3 && !winners.halfSheet) {
      winners.halfSheet = { name: user, tickets: ticketSerials };
      addWinner("halfSheet", user, ticketSerials, "Half Sheet");
    }
  }

  localStorage.setItem("tambolaWinners", JSON.stringify(winners));
}

function checkAllWinnersDeclared() {
  const winners = JSON.parse(localStorage.getItem("tambolaWinners") || "{}");

  const allEnabledModes = Object.keys(activeGameModes).filter(mode => activeGameModes[mode]);
  const declaredWinners = Object.keys(winners);

  const allDeclared = allEnabledModes.every(mode => declaredWinners.includes(mode));

  if (allDeclared) {
    stopCallingNumbers(); 
    alert("🎉 All enabled winners declared. Number calling stopped!");
  }
}


function addWinnerToUI(id, user) {
  const section = document.getElementById(id);
  if (!section) return;

  const ul = section.querySelector("ul");
  const alreadyListed = Array.from(ul.children).some(li => li.textContent === user);

  if (!alreadyListed) {
    const li = document.createElement("li");
    li.textContent = user;
    ul.appendChild(li);
  }
}

//  game winning logic above-----


window.addEventListener("DOMContentLoaded", () => {
  loadTicketsFromStorage();
  renderTickets();
  highlightCalledNumbers();
  startCountdown();
  setupCallerSystem();
  loadWinners();
const activeGameModes = JSON.parse(localStorage.getItem("tambolaGameModes") || "{}");
if (!activeGameModes.fullSheet) {
  activeGameModes.fullSheetBonus = false;
}

Object.entries(activeGameModes).forEach(([mode, isEnabled]) => {
  if (!isEnabled) {
    const div = document.getElementById(mode);
    if (div) div.remove();
  }
});
Object.entries(activeGameModes).forEach(([mode, isEnabled]) => {
  if (!isEnabled) {
    const div = document.getElementById(mode);
    if (div) div.remove();
  }
});

if (localStorage.getItem("confirmStart") === "true") {
  ticketSection.style.display = "none";
  gameplayArea.style.display = "block";
}

document.getElementById("availableTicketsBtn").addEventListener("click", openPopup);
document.getElementById("closePopup").addEventListener("click", closePopup);
document.getElementById("bookSelected").addEventListener("click", bookSelectedTickets);

function addWinner(id, name, tickets = [], label = "") {
  const ul = document.querySelector(`#${id} ul`);
  if (!ul) return;

  const li = document.createElement("li");
  const ticketStr = tickets.length ? ` [${tickets.join(", ")}]` : "";
  li.textContent = label ? `${label} – ${name}${ticketStr}` : `${name}${ticketStr}`;

  if (id === "fullSheetBonus") {
    li.classList.add("bonus-winner");
  }

  ul.appendChild(li);
}
function loadWinners() {
  const winners = JSON.parse(localStorage.getItem("tambolaWinners") || "{}");

  for (const [key, value] of Object.entries(winners)) {
    let name, tickets = [], label = "";

    if (typeof value === "string") {
      name = value;
    } else {
      name = value.name;
      tickets = value.tickets || [];
    }

    switch (key) {
      case "quick5": label = "Quick 5"; break;
      case "topLine": label = "Top Line"; break;
      case "middleLine": label = "Middle Line"; break;
      case "bottomLine": label = "Bottom Line"; break;
      case "fullHouse": label = "Full House"; break;
      case "secondFullHouse": label = "Second Full House"; break;
      case "star": label = "Star"; break;
      case "fullSheet": label = "Full Sheet"; break;
      case "halfSheet": label = "Half Sheet"; break;
      case "fullSheetBonus": label = "Full Sheet Bonus"; break;
    }

    addWinner(key === "secondFullHouse" ? "secondHouse" : key, name, tickets, label);
  }
}
function checkAllWinnersDeclared() {
  const winners = JSON.parse(localStorage.getItem("tambolaWinners") || "{}");
  return Object.entries(activeGameModes)
    .filter(([_, enabled]) => enabled)
    .every(([mode]) => winners[mode]);
}
loadWinners();
})
