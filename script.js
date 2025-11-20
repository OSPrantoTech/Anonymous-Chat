// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// আপনার অ্যাপের কনফিগারেশন (আপনার দেওয়া তথ্য বসানো আছে)
const firebaseConfig = {
  apiKey: "AIzaSyCz6tTqCEU2-Tm2jToKjJ5OACpSbonwXiE",
  authDomain: "anonymous-chat-d6512.firebaseapp.com",
  databaseURL: "https://anonymous-chat-d6512-default-rtdb.firebaseio.com",
  projectId: "anonymous-chat-d6512",
  storageBucket: "anonymous-chat-d6512.firebasestorage.app",
  messagingSenderId: "922549544704",
  appId: "1:922549544704:web:0025aeb67bcf5a74c0b5e5",
  measurementId: "G-05M7QCFP81"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// নতুন ভেরিয়েবল: ইউজার নাম স্টোর করার জন্য
let currentRoom = "";
let myID = Math.random().toString(36).substr(2, 9);
let myUsername = ""; // <-- NEW VARIABLE

// HTML এলিমেন্ট ধরা
const usernameInput = document.getElementById('usernameInput'); // <-- NEW ELEMENT
const roomInput = document.getElementById('roomInput');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const chatWindow = document.getElementById('chatWindow');

// Join Room Function - UPDATED
window.joinRoom = function() {
    const username = usernameInput.value.trim(); // Get Username
    const roomName = roomInput.value.trim();

    if (!username) { // Name validation
        alert("Please enter your name!");
        return;
    }
    if (!roomName) {
        alert("Please enter a room name!");
        return;
    }

    myUsername = username; // Store Username
    currentRoom = roomName;
    document.querySelector('.welcome-msg').style.display = 'none';
    
    // Disable Room/Name inputs after joining
    usernameInput.disabled = true;
    roomInput.disabled = true;
    msgInput.disabled = false;
    sendBtn.disabled = false;
    
    alert(`Welcome, ${myUsername}! You joined the "${currentRoom}" room.`);
    loadMessages();
};

// Send Message Function - UPDATED
window.sendMessage = function() {
    const msg = msgInput.value.trim();
    if (msg === "") return;

    const messagesRef = ref(db, `chat_rooms/${currentRoom}`);
    push(messagesRef, {
        text: msg,
        senderID: myID,
        senderName: myUsername, // <-- SENDING NAME
        timestamp: Date.now()
    });

    msgInput.value = ""; 
};

// Receive Messages Function - UPDATED
function loadMessages() {
    const messagesRef = ref(db, `chat_rooms/${currentRoom}`);
    
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        // Passing the new 'senderName' data
        displayMessage(data.text, data.senderID, data.senderName); // <-- PASSING NAME
    });
}

// Display Message on Screen - UPDATED
function displayMessage(text, senderID, senderName) { // <-- RECEIVING NAME
    const chatWindow = document.getElementById('chat-window');
    const div = document.createElement('div');
    
    div.classList.add('message');
    
    if (senderID === myID) {
        div.classList.add('my-message');
    } else {
        div.classList.add('other-message');
    }
    
    // Create the name element
    const nameSpan = document.createElement('span');
    nameSpan.classList.add('sender-name');
    nameSpan.innerText = senderName; // Set the name
    
    // Create the text element
    const textP = document.createElement('p');
    textP.innerText = text;

    // Append Name and Text to the message div
    div.appendChild(nameSpan);
    div.appendChild(textP);

    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to toggle the About Modal (Unchanged)
window.toggleAbout = function() {
    const modal = document.getElementById('aboutModal');
    const currentDisplay = window.getComputedStyle(modal).display;
    
    if (currentDisplay === "flex") {
        modal.style.display = "none";
    } else {
        modal.style.display = "flex";
    }
}
