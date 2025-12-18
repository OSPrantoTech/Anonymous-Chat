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
    document.getElementById('chat-interface').style.display = 'flex';
    document.querySelector('#roomTitle span').innerText = currentRoom;

    document.getElementById('msgInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;

    db.ref(`chats/${currentRoom}`).on('child_added', (snap) => {
        const data = snap.val();
        displayMessage(data);
    });

    // Presence Logic
    const presenceRef = db.ref(`online/${currentRoom}/${myID}`);
    presenceRef.set({ name: myName });
    presenceRef.onDisconnect().remove();

    db.ref(`online/${currentRoom}`).on('value', (snap) => {
        document.getElementById('userCount').innerText = snap.numChildren();
    });
};

window.sendMessage = function() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if(!text) return;

    db.ref(`chats/${currentRoom}`).push({
        id: myID,
        name: myName,
        text: text,
        time: Date.now()
    });
    input.value = "";
};

function displayMessage(data) {
    const chatWin = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `message ${data.id === myID ? 'my-message' : 'other-message'}`;
    
    const time = new Date(data.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    div.innerHTML = `
        <span class="sender-name">${data.id === myID ? 'SYSTEM (YOU)' : data.name}</span>
        <div>${data.text}</div>
        <span style="font-size: 0.6rem; opacity: 0.5; display: block; margin-top: 5px; text-align: right;">${time}</span>
    `;
    chatWin.appendChild(div);
    chatWin.scrollTop = chatWin.scrollHeight;
}

window.toggleAbout = () => {
    const m = document.getElementById('aboutModal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.toggleContact = () => {
    const m = document.getElementById('contactModal');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

document.getElementById('msgInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
