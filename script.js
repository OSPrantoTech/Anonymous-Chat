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

let currentRoom = "";
let myID = Math.random().toString(36).substr(2, 9);
let myUsername = "";

// 1. Join Room
window.joinRoom = function() {
    const username = document.getElementById('usernameInput').value.trim();
    const roomName = document.getElementById('roomInput').value.trim();

    if (!username || !roomName) {
        alert("Please enter both your name and a room name!");
        return;
    }

    myUsername = username;
    currentRoom = roomName;
    
    document.querySelector('.welcome-msg').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('roomTitle').innerText = `Room: ${currentRoom}`;

    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    loadMessages();
};

// 2. Send Message
window.sendMessage = function() {
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
};

// 3. Modal Toggles (FIXED)
window.toggleAbout = function() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

window.toggleContact = function() {
    const modal = document.getElementById('contactModal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

function loadMessages() {
    db.ref(`chat_rooms/${currentRoom}`).on('child_added', (snap) => {
        const data = snap.val();
        const win = document.getElementById('chat-window');
        const div = document.createElement('div');
        div.className = `message ${data.senderID === myID ? 'my-message' : 'other-message'}`;
        div.innerHTML = `<strong>${data.senderName}</strong><p>${data.text}</p>`;
        win.appendChild(div);
        win.scrollTop = win.scrollHeight;
    });
}
