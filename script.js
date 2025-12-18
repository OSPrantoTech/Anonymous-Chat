// Firebase Config (Keep your existing config)
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

// Elements
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const msgInput = document.getElementById('msgInput');
const chatWindow = document.getElementById('chat-window');

// Day/Night Logic
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('osp-theme', isDark ? 'dark' : 'light');
});

// Load Preference
if(localStorage.getItem('osp-theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// ... existing joinRoom, sendMessage logic ...
// (ঐ পুরনো কোডের ফাংশনগুলো আগের মতোই কাজ করবে)
