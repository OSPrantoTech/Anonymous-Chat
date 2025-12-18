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
const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

// Elements
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const msgInput = document.getElementById('msgInput');
const chatWindow = document.getElementById('chat-window');

// Theme Logic
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('osp-theme', isDark ? 'dark' : 'light');
});

if(localStorage.getItem('osp-theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Global Variables
let currentRoom = "";
let myID = Math.random().toString(36).substr(2, 9);
let myUsername = "";
const notificationSound = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

window.joinRoom = function() {
    const user = document.getElementById('usernameInput').value.trim();
    const room = document.getElementById('roomInput').value.trim();

    if (!user || !room) return alert("Fill all fields!");

    myUsername = user;
    currentRoom = room;
    
    document.querySelector('.welcome-msg').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('roomTitle').innerText = `Room: ${currentRoom}`;

    msgInput.disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    loadMessages();
    setupPresence();
};

window.sendMessage = function() {
    const msg = msgInput.value.trim();
    if (!msg) return;

    db.ref(`chat_rooms/${currentRoom}`).push({
        text: msg,
        senderID: myID,
        senderName: myUsername,
        timestamp: serverTimestamp
    });

    msgInput.value = "";
};

function loadMessages() {
    db.ref(`chat_rooms/${currentRoom}`).on('child_added', (snap) => {
        const data = snap.val();
        displayMessage(data.text, data.senderID, data.senderName, data.timestamp);
    });
}

function displayMessage(text, senderID, senderName, timestamp) {
    const div = document.createElement('div');
    div.className = `message ${senderID === myID ? 'my-message' : 'other-message'}`;
    
    if(senderID !== myID) notificationSound.play();

    div.innerHTML = `
        <span class="sender-name">${senderID === myID ? 'You' : senderName}</span>
        <div>${text}</div>
        <span class="timestamp">${formatTime(timestamp)}</span>
    `;

    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setupPresence() {
    const ref = db.ref(`room_presence/${currentRoom}/${myID}`);
    ref.onDisconnect().remove();
    ref.set({ name: myUsername });

    db.ref(`room_presence/${currentRoom}`).on('value', (snap) => {
        document.getElementById('userCount').innerText = snap.numChildren();
    });
}

msgInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') window.sendMessage(); });

window.toggleAbout = () => { document.getElementById('aboutModal').style.display = 
    document.getElementById('aboutModal').style.display === 'flex' ? 'none' : 'flex'; };

window.toggleContact = () => { document.getElementById('contactModal').style.display = 
    document.getElementById('contactModal').style.display === 'flex' ? 'none' : 'flex'; };
