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

window.joinRoom = function() {
    myUsername = document.getElementById('usernameInput').value.trim();
    currentRoom = document.getElementById('roomInput').value.trim();

    if (!myUsername || !currentRoom) return alert("Fill all fields!");

    document.getElementById('room-info').style.display = 'none';
    document.querySelector('.welcome-msg').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('roomTitle').innerText = `Room: ${currentRoom}`;
    
    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;

    loadMessages();
    setupPresence();
};

window.sendMessage = function() {
    const msg = document.getElementById('msgInput').value.trim();
    if (!msg) return;
    db.ref(`chat_rooms/${currentRoom}`).push({
        text: msg, senderID: myID, senderName: myUsername, timestamp: Date.now()
    });
    document.getElementById('msgInput').value = "";
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
    const time = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    div.innerHTML = `
        <span class="sender-name">${senderID === myID ? 'You' : senderName}</span>
        <div>${text}</div>
        <span class="timestamp">${time}</span>
    `;
    document.getElementById('chat-window').appendChild(div);
    document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
}

window.toggleAbout = () => {
    const m = document.getElementById('aboutModal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.toggleContact = () => {
    const m = document.getElementById('contactModal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

document.getElementById('msgInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') window.sendMessage();
});

function setupPresence() {
    const ref = db.ref(`room_presence/${currentRoom}/${myID}`);
    ref.onDisconnect().remove();
    ref.set({ name: myUsername });
    db.ref(`room_presence/${currentRoom}`).on('value', (snap) => {
        document.getElementById('userCount').innerText = snap.numChildren();
    });
}
