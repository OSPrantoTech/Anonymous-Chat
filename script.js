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

let myID = Math.random().toString(36).substr(2, 9);
let currentRoom = "";
let myName = "";

window.joinRoom = function() {
    myName = document.getElementById('usernameInput').value.trim();
    currentRoom = document.getElementById('roomInput').value.trim();

    if(!myName || !currentRoom) return alert("System requires access credentials.");

    document.getElementById('room-info').style.display = 'none';
    document.getElementById('intro-text').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.querySelector('#roomTitle span').innerText = currentRoom;

    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;

    loadMessages();
    setupPresence();
};

function loadMessages() {
    db.ref(`chat_rooms/${currentRoom}`).on('child_added', (snap) => {
        const data = snap.val();
        displayMessage(data.text, data.senderID, data.senderName, data.timestamp);
    });
}

function displayMessage(text, senderID, senderName, timestamp) {
    const chatWin = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `message ${senderID === myID ? 'my-message' : 'other-message'}`;
    
    const time = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    div.innerHTML = `
        <span class="sender-name">${senderID === myID ? 'You' : senderName}</span>
        <div class="msg-content">${text}</div>
        <span class="timestamp">${time}</span>
    `;
    chatWin.appendChild(div);
    chatWin.scrollTop = chatWin.scrollHeight;
}

window.sendMessage = function() {
    const input = document.getElementById('msgInput');
    const msg = input.value.trim();
    if(!msg) return;

    db.ref(`chat_rooms/${currentRoom}`).push({
        text: msg,
        senderID: myID,
        senderName: myName,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    input.value = "";
};

function setupPresence() {
    const ref = db.ref(`room_presence/${currentRoom}/${myID}`);
    ref.onDisconnect().remove();
    ref.set({ name: myName });

    db.ref(`room_presence/${currentRoom}`).on('value', (snap) => {
        document.getElementById('userCount').innerText = snap.numChildren();
    });
}

window.toggleAbout = () => {
    const m = document.getElementById('aboutModal');
    m.style.display = (window.getComputedStyle(m).display === 'flex') ? 'none' : 'flex';
};

window.toggleContact = () => {
    const m = document.getElementById('contactModal');
    m.style.display = (window.getComputedStyle(m).display === 'flex') ? 'none' : 'flex';
};

document.getElementById('msgInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
