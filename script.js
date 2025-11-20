// Import Firebase and required functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onValue, set, onDisconnect, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Firebase Configuration (Using your provided config)
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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global Variables
let currentRoom = "";
let myID = Math.random().toString(36).substr(2, 9);
let myUsername = "";

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

// NEW ELEMENTS FOR SEPARATION
const aboutBtn = document.getElementById('aboutBtn');
const contactBtn = document.getElementById('contactBtn');

// Feature: Notification Sound
const notificationSound = new Audio('https://www.soundjay.com/buttons/beep-07.mp3'); 

// Utility Function: Format Timestamp
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

// Join Room Function
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
    chatInterface.style.display = 'flex'; // Use flex for better mobile layout
    roomTitleDisplay.innerText = `Room: ${currentRoom}`;

    // Disable inputs
    usernameInput.disabled = true;
    roomInput.disabled = true;
    joinBtn.disabled = true;
    msgInput.disabled = false;
    sendBtn.disabled = false;
    
    // Core Fix: Hide both buttons after joining
    aboutBtn.style.display = 'none';
    contactBtn.style.display = 'none'; 

    chatWindow.innerHTML = ''; 
    loadMessages();
    setupPresence();
};

// Send Message Function
window.sendMessage = function() {
    const msg = msgInput.value.trim();
    if (msg === "") return;

    const messagesRef = ref(db, `chat_rooms/${currentRoom}`);
    push(messagesRef, {
        text: msg,
        senderID: myID,
        senderName: myUsername,
        timestamp: serverTimestamp()
    });

    msgInput.value = "";
};

// Message Listener (Load Messages)
function loadMessages() {
    const messagesRef = ref(db, `chat_rooms/${currentRoom}`);
    
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        displayMessage(data.text, data.senderID, data.senderName, data.timestamp);
    });
}

// User Counter (Presence Setup)
function setupPresence() {
    const roomPresenceRef = ref(db, `room_presence/${currentRoom}/${myID}`);
    
    onDisconnect(roomPresenceRef).remove();
    
    set(roomPresenceRef, {
        name: myUsername,
        timestamp: serverTimestamp()
    });

    const roomPresenceListRef = ref(db, `room_presence/${currentRoom}`);
    onValue(roomPresenceListRef, (snapshot) => {
        const count = snapshot.exists() ? snapshot.size : 0;
        userCountDisplay.innerText = count;
    });
}

// Display Message on Screen
function displayMessage(text, senderID, senderName, timestamp) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    if (senderID === myID) {
        div.classList.add('my-message');
    } else {
        div.classList.add('other-message');
        notificationSound.play(); // Play sound for incoming messages
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

// FIX: Toggle About Modal
window.toggleAbout = function() {
    const modal = document.getElementById('aboutModal');
    const currentDisplay = window.getComputedStyle(modal).display;
    
    if (currentDisplay === "flex") {
        modal.style.display = "none";
    } else {
        modal.style.display = "flex";
    }
}

// FIX: Toggle Contact Modal
window.toggleContact = function() {
    const modal = document.getElementById('contactModal');
    const currentDisplay = window.getComputedStyle(modal).display;
    
    if (currentDisplay === "flex") {
        modal.style.display = "none";
    } else {
        modal.style.display = "flex";
    }
}

// NEW FEATURE: Send message using Enter key
msgInput.addEventListener('keypress', function (e) {
    // Check if the input is enabled and the key pressed is Enter (key code 13)
    if (!msgInput.disabled && e.key === 'Enter') {
        e.preventDefault(); // Prevent the default action (like new line)
        window.sendMessage();
    }
});
