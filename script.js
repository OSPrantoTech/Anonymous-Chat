// --- script.js (চূড়ান্ত সংস্করণ) ---

// Firebase Configuration (আপনার আগের কনফিগারেশন)
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

// এই কোডটি HTML-এর <script src="script.js"></script> এর সাথে কাজ করবে

// Initialize Firebase (Functions must be loaded globally)
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

const aboutBtn = document.getElementById('aboutBtn');
const contactBtn = document.getElementById('contactBtn');

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
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

// ----------------------------------------------------
// CORE FUNCTIONS (Now Global due to standard <script> loading)
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
    chatInterface.style.display = 'flex'; // Shows chat interface
    roomTitleDisplay.innerText = `Room: ${currentRoom}`;

    // Disable/Enable Inputs
    usernameInput.disabled = true;
    roomInput.disabled = true;
    joinBtn.disabled = true;
    msgInput.disabled = false;
    sendBtn.disabled = false;
    
    // Fix: Hide both buttons after joining
    aboutBtn.style.display = 'none';
    contactBtn.style.display = 'none'; 

    chatWindow.innerHTML = ''; 
    loadMessages();
    setupPresence();
};

// 2. Send Message Function
window.sendMessage = function() {
    const msg = msgInput.value.trim();
    if (msg === "") return;

    const messagesRef = db.ref(`chat_rooms/${currentRoom}`);
    messagesRef.push({
        text: msg,
        senderID: myID,
        senderName: myUsername,
        timestamp: serverTimestamp
    });

    msgInput.value = "";
};

// 3. Toggle About Modal
window.toggleAbout = function() {
    const modal = document.getElementById('aboutModal');
    const currentDisplay = window.getComputedStyle(modal).display;
    modal.style.display = (currentDisplay === "flex") ? "none" : "flex";
}

// 4. Toggle Contact Modal
window.toggleContact = function() {
    const modal = document.getElementById('contactModal');
    const currentDisplay = window.getComputedStyle(modal).display;
    modal.style.display = (currentDisplay === "flex") ? "none" : "flex";
}


// ----------------------------------------------------
// EVENT LISTENERS & BACKGROUND LOGIC
// ----------------------------------------------------

function loadMessages() {
    const messagesRef = db.ref(`chat_rooms/${currentRoom}`);
    
    messagesRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        displayMessage(data.text, data.senderID, data.senderName, data.timestamp);
    });
}

function setupPresence() {
    const roomPresenceRef = db.ref(`room_presence/${currentRoom}/${myID}`);
    
    roomPresenceRef.onDisconnect().remove();
    
    roomPresenceRef.set({
        name: myUsername,
        timestamp: serverTimestamp
    });

    const roomPresenceListRef = db.ref(`room_presence/${currentRoom}`);
    roomPresenceListRef.on('value', (snapshot) => {
        const count = snapshot.numChildren(); // Use numChildren for simple counting
        userCountDisplay.innerText = count;
    });
}

function displayMessage(text, senderID, senderName, timestamp) {
    // (Content remains the same)
    // ... [Message display logic] ...
    const div = document.createElement('div');
    div.classList.add('message');
    
    if (senderID === myID) {
        div.classList.add('my-message');
    } else {
        div.classList.add('other-message');
        notificationSound.play(); 
    }
    
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('message-header');

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('sender-name');
    nameSpan.innerText = senderName;

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('timestamp');
    timeSpan.innerText = formatTime(timestamp); 

    const textP = document.createElement('p');
    textP.innerText = text;

    headerDiv.appendChild(nameSpan);
    headerDiv.appendChild(timeSpan);
    div.appendChild(headerDiv);
    div.appendChild(textP);

    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


// NEW FEATURE: Send message using Enter key
msgInput.addEventListener('keypress', function (e) {
    if (!msgInput.disabled && e.key === 'Enter') {
        e.preventDefault(); 
        window.sendMessage();
    }
});


// ----------------------------------------------------
// UI Fixes on Load
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // FIX: Ensure both Modals are hidden on page load
    document.getElementById('aboutModal').style.display = 'none';
    document.getElementById('contactModal').style.display = 'none';
    
    // FIX: If chatInterface is accidentally visible, ensure it's hidden unless joined
    if (chatInterface) {
        chatInterface.style.display = 'none';
    }
});
