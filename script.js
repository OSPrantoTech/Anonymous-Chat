// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCz6tTqCEU2-Tm2jToKj5OACpSbonwXiE",
    authDomain: "anonymous-chat-d6512.firebaseapp.com",
    databaseURL: "https://anonymous-chat-d6512-default-rtdb.firebaseio.com",
    projectId: "anonymous-chat-d6512",
    storageBucket: "anonymous-chat-d6512.firebasestorage.app",
    messagingSenderId: "922549544704",
    appId: "1:922549544704:web:0025aeb67bcf5a74c0b5e5"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global variables
let currentRoom = "";
let myID = Math.random().toString(36).substr(2, 9);
let myUsername = "";

// Theme Logic
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('osp-theme', isDark ? 'dark' : 'light');
});

if(localStorage.getItem('osp-theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Fixed Toggle Functions
window.toggleAbout = function() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

window.toggleContact = function() {
    const modal = document.getElementById('contactModal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

// Fixed Join Adventure Logic
document.getElementById('joinBtn').addEventListener('click', function() {
    const user = document.getElementById('usernameInput').value.trim();
    const room = document.getElementById('roomInput').value.trim();

    if (!user || !room) {
        alert("Please enter both name and room!");
        return;
    }

    myUsername = user;
    currentRoom = room;

    document.getElementById('room-info').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('roomTitle').innerText = `Room: ${currentRoom}`;
    
    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;

    loadMessages();
    setupPresence();
});

function sendMessage() {
    const msgInput = document.getElementById('msgInput');
    const msg = msgInput.value.trim();
    if (msg === "") return;

    db.ref(`chat_rooms/${currentRoom}`).push({
        text: msg,
        senderID: myID,
        senderName: myUsername,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    msgInput.value = "";
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('msgInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendMessage();
});

function loadMessages() {
    db.ref(`chat_rooms/${currentRoom}`).on('child_added', (snap) => {
        const data = snap.val();
        displayMessage(data.text, data.senderID, data.senderName, data.timestamp);
    });
}

function displayMessage(text, senderID, senderName, timestamp) {
    const div = document.createElement('div');
    div.className = `message ${senderID === myID ? 'my-message' : 'other-message'}`;
    const time = timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
    
    div.innerHTML = `
        <span class="sender-name">${senderID === myID ? 'You' : senderName}</span>
        <div>${text}</div>
        <span class="timestamp" style="font-size: 0.6rem; opacity: 0.7;">${time}</span>
    `;
    document.getElementById('chat-window').appendChild(div);
    document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
}

function setupPresence() {
    const ref = db.ref(`room_presence/${currentRoom}/${myID}`);
    ref.onDisconnect().remove();
    ref.set({ name: myUsername });
    db.ref(`room_presence/${currentRoom}`).on('value', (snap) => {
        document.getElementById('userCount').innerText = snap.numChildren();
    });
}
