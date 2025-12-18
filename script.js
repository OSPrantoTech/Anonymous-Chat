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

    if(!myName || !currentRoom) return alert("System access denied.");

    // Hide Login and Lower Info space
    document.getElementById('room-info').style.display = 'none';
    document.getElementById('extra-info').style.display = 'none';
    
    // Show Chat Interface
    document.getElementById('chat-interface').style.display = 'flex';
    document.querySelector('#roomTitle span').innerText = currentRoom;

    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;

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

    div.innerHTML = `<span style="font-size:0.65rem; color:var(--accent); font-weight:bold;">${id===myID?'YOU':name}</span>
                     <div>${text}</div>
                     <span style="font-size:0.55rem; opacity:0.5; text-align:right; display:block; margin-top:4px;">${t}</span>`;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

window.sendMessage = function() {
    const input = document.getElementById('msgInput');
    if(!input.value.trim()) return;
    db.ref(`chat_rooms/${currentRoom}`).push({
        text: input.value, senderID: myID, senderName: myName, timestamp: Date.now()
    });
    input.value = "";
};

// Modal Logic
window.toggleAbout = () => {
    const m = document.getElementById('aboutModal');
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
};
window.toggleContact = () => {
    const m = document.getElementById('contactModal');
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
};

document.getElementById('msgInput').addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });
