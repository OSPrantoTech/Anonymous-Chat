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

    if(!myName || !currentRoom) return alert("Credentials required.");

    // UI Switching
    document.getElementById('room-info').style.display = 'none';
    document.getElementById('extra-info').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.querySelector('#roomTitle span').innerText = currentRoom;

    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;

    // Load Messages
    db.ref(`chat_rooms/${currentRoom}`).on('child_added', snap => {
        const d = snap.val();
        displayMessage(d.text, d.senderID, d.senderName, d.timestamp);
    });
};

function displayMessage(text, id, name, time) {
    const win = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `message ${id === myID ? 'my-message' : 'other-message'}`;
    const t = new Date(time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    div.innerHTML = `<span class="sender-name">${id===myID?'YOU':name}</span>
                     <div>${text}</div>
                     <span class="timestamp">${t}</span>`;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

window.sendMessage = function() {
    const input = document.getElementById('msgInput');
    const msg = input.value.trim();
    if(!msg) return;

    db.ref(`chat_rooms/${currentRoom}`).push({
        text: msg,
        senderID: myID,
        senderName: myName,
        timestamp: Date.now()
    });
    input.value = "";
};

// --- ENTER KEY LOGIC ---
document.getElementById('msgInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Modal Toggles
window.toggleAbout = () => {
    const m = document.getElementById('aboutModal');
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
};
window.toggleContact = () => {
    const m = document.getElementById('contactModal');
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
};
