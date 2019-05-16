// Database References
const auth = firebase.auth();
const database = firebase.database();
const pollRef = firebase.database().ref('/polls');
const userRef = firebase.database().ref('/users');
const chatRef = firebase.database().ref('/chats');
const feedbackRef = firebase.database().ref('/feedback');


//Dom
const chatWrapper = document.querySelector("#chat");
const chatContainer = document.querySelector("#chatcontainer");
const allMessages = document.querySelectorAll(".msg-container");
const feedbackContainer = document.querySelector("#feedback");

// User handling
auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log("user is signed in");
        chatRef.on("value", () => {
            loadMessages();
        });

    } else {
        // No user is signed in.
        console.log("user is not signed in");
        window.location = "index.html"
    };
});

// Login & logout
const login = () => {
    auth.signInAnonymously().catch(function (error) { window.alert(error.message) });
};
const logout = () => {
    setTimeout(
        auth.currentUser.delete().then(function () { chatRef.remove() }).catch(function (error) { window.alert(error.message) }), 5000
    )
};


// Load messages
const loadMessages = () => {
    chatRef.once("value", (snapshot) => {
        chatContainer.innerHTML = "";

        snapshot.forEach((childsnap) => {
            let newMessageContent = childsnap.val();
            let newMessage = document.createElement("div");
            newMessage.classList.add("msg-container");

            if (newMessageContent.uid == auth.currentUser.uid) {
                newMessage.classList.add("sent");
            } else {
                newMessage.classList.add("received");
            };

            let messageDiv = document.createElement("div");
            messageDiv.classList.add("message");
            let messageContent = document.createElement("p");
            messageContent.classList.add("msg-content");
            messageContent.innerHTML = newMessageContent.message;
            let messageTimestamp = document.createElement("span");
            let hours = new Date(newMessageContent.timestamp).getHours();
            let minutes = new Date(newMessageContent.timestamp).getMinutes();
            messageTimestamp.innerHTML = `${hours}:${minutes}`;
            messageTimestamp.classList.add("timestamp");


            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageTimestamp);
            newMessage.appendChild(messageDiv);

            chatContainer.appendChild(newMessage);
        });

        if (snapshot.val()) {
            let chatLength = Object.keys(snapshot.val()).length;
            if (chatLength == 10) {
                feedbackContainer.style.display = "grid";
            };
            if (chatLength >= 3 && chatLength <= 8) {
                let newAlert = document.createElement("div");
                newAlert.classList.add("msg-container");
                newAlert.classList.add("middle");
                newAlert.innerHTML = `<div class="message"><p class="msg-content">Jullie zijn een match omdat jullie allebei een huisdier hebben, misschien een leuk onderwerp om over te kletsen! 😼</p></div>`;
                chatContainer.appendChild(newAlert);
            };

            chatWrapper.scrollTop = chatContainer.scrollHeight;
        } else if (!snapshot.val()) {
            let newAlert = document.createElement("div");
            newAlert.classList.add("msg-container");
            newAlert.classList.add("middle");
            newAlert.innerHTML = `<div class="message"><p class="msg-content">Zet de eeste stap!</p></div>`;
            chatContainer.appendChild(newAlert);
        };
    });
};


// Send messages
const sendMessage = () => {
    let message = document.querySelector("#messageInput");
    if (message.value) {
        let payload = {
            message: message.value,
            timestamp: Date.now(),
            uid: auth.currentUser.uid
        }
        message.value = "";
        chatRef.push(payload);
        loadMessages();
    } else {
        message.placeholder = "Typ eerst een bericht om een bericht te versturen";
    };
};


// Nav Buttons
const backBtn = document.querySelector("#nav-back");
const logoutBtn = document.querySelector("#nav-logout");
const settingsBtn = document.querySelector("#nav-settings");
const infoBtn = document.querySelector("#nav-info");

backBtn.addEventListener("click", () => {
    window.location = "index.html";
});

logoutBtn.addEventListener("click", logout);

// Feedback
feedbackContainer.style.display = "none";
let range = document.querySelector("#range");
let feedbackBtn = document.querySelector("#sendFeedback");
let feedbackTitle = document.querySelector("#feedback-title");

let rangeFunc = (e) => {
    if (range.value == 100) { feedbackBtn.value = "😇"; }
    else if (range.value > 75 && range.value < 100) { feedbackBtn.value = "😊"; }
    else if (range.value > 50 && range.value < 76) { feedbackBtn.value = "😀"; }
    else if (range.value > 25 && range.value < 51) { feedbackBtn.value = "😒"; }
    else if (range.value > 10 && range.value < 26) { feedbackBtn.value = "😫"; }
    else if (range.value > 0 && range.value < 11) { feedbackBtn.value = "😥"; }
    else if (range.value == 0) { feedbackBtn.value = "😭"; }
}

let likeFunc = (e) => {
    if (range.value > 59) { feedbackBtn.value = "Ja, graag! 😄"; }
    if (range.value > 0 && range.value < 50) { feedbackBtn.value = "Misschien later! 🙃"; }
    else if (range.value == 0) { feedbackBtn.value = "Nee, liever niet. 😌"; }

    feedbackBtn.addEventListener("click", stayFunc);
}

let stayFunc = (e) => {
    if (range.value > 59) {
        feedbackContainer.style.display = "none";

    } else if (range.value < 50) {
        console.log(range.value);
        window.location = "index.html";;
        return false;
    }
}

range.addEventListener("input", rangeFunc);

feedbackBtn.addEventListener("click", (e) => {
    feedbackRef.child(`/${auth.currentUser.uid}/range`).set(range.value);
    feedbackTitle.innerText = "Wil je verdergaan met het gesprek?"
    range.removeEventListener("input", rangeFunc);
    range.addEventListener("input", likeFunc);
    likeFunc();
    feedbackBtn.style.fontSize = "14px";
    feedbackBtn.style.padding = "10px";
})