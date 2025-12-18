// --- script.js (OSPranto Tech Chat - Optimized Version) ---

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCz6tTqCEU2-Tm2jToKj5OACpSbonwXiE",
    authDomain: "anonymous-chat-d6512.firebaseapp.com",
    databaseURL: "https://anonymous-chat-d6512-default-rtdb.firebaseio.com",
    projectId: "anonymous-chat-d6512",
    storageBucket: "anonymous-chat-d6512.firebasestorage.app",
    messagingSenderId: "922549544704",
    appId: "1:922549544704:web:0025aeb67bcf5a74c0b5e5",
    measurementId: "G-05M7QCFP81"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

// HTML Elements
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const joinBtn = document.getElementById('joinBtn');
const chatInterface = document.getElementById('chat-interface');
const chatWindow = document.getElementById('chat-window');
const roomTitleDisplay = document.getElementById('roomTitle');
const userCountDisplay = document.getElementById('userCount');

// Feature: Notification Sound
const notificationSound = new Audio('https://www.soundjay.com/buttons/beep-07.mp3'); 

// Global Variables
let currentRoom = "";
let myID = Math.random().toString(36).substr(2, 9);
let myUsername = "";

// Helper Function: Format Timestamp
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ----------------------------------------------------
// CORE FUNCTIONS
// ----------------------------------------------------

// 1. Join Room Function
window.joinRoom = function() {
    const username = usernameInput.value.trim();
    const roomName = roomInput.value.trim();

    if (!username || !roomName) {
        alert("Please enter both your name and a room name!");
        return;
    }

    myUsername = username;
    currentRoom = roomName;
    
    // UI Update
    document.querySelector('.welcome-msg').style.display = 'none';
    document.getElementById('room-info').style.display = 'none';
    chatInterface.style.display = 'flex';
    roomTitleDisplay.innerText = `Room: ${currentRoom}`;

    // Enable Message Input
    msgInput.disabled = false;
    sendBtn.disabled = false;
    
    chatWindow.innerHTML = ''; 
    loadMessages();
    setupPresence();
};

// 2. Send Message Function
window.sendMessage = function() {
    const msg = msgInput.value.trim();
    if (msg === "") return;

    db.ref(`chat_rooms/${currentRoom}`).push({
        text: msg,
        senderID: myID,
        senderName: myUsername,
        timestamp: serverTimestamp
    });

    msgInput.value = "";
};

// 3. Toggle Modals
window.toggleAbout = function() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
}

window.toggleContact = function() {
    const modal = document.getElementById('contactModal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
}

// ----------------------------------------------------
// BACKGROUND LOGIC
// ----------------------------------------------------

function loadMessages() {
    const messagesRef = db.ref(`chat_rooms/${currentRoom}`);
    messagesRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        displayMessage(data.text, data.senderID, data.senderName, data.timestamp);
    });
}

function displayMessage(text, senderID, senderName, timestamp) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    // নিজের মেসেজ ডানে এবং অন্যের বামে নেওয়ার লজিক
    if (senderID === myID) {
        div.classList.add('my-message');
    } else {
        div.classList.add('other-message');
        notificationSound.play(); 
    }
    
    div.innerHTML = `
        <span class="sender-name">${senderID === myID ? 'You' : senderName}</span>
        <div class="msg-content">${text}</div>
        <span class="timestamp">${formatTime(timestamp)}</span>
    `;

    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setupPresence() {
    const roomPresenceRef = db.ref(`room_presence/${currentRoom}/${myID}`);
    roomPresenceRef.onDisconnect().remove();
    roomPresenceRef.set({ name: myUsername });

    db.ref(`room_presence/${currentRoom}`).on('value', (snapshot) => {
        userCountDisplay.innerText = snapshot.numChildren();
    });
}

// Event Listeners
msgInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        window.sendMessage();
    }
});

// Theme Toggle Logic
const themeBtn = document.getElementById('themeToggle');
if(themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}
