// References
const auth = firebase.auth();
const database = firebase.database();
const pollRef = firebase.database().ref('/polls');
const userRef = firebase.database().ref('/users');
const chatRef = firebase.database().ref('/chats');


// Dom
const landing = document.querySelector("#landing");
const main = document.querySelector("#main");
const polls = document.querySelectorAll(".poll-options");
const pollTitle = document.querySelector("#poll-title");
const popup = document.querySelector("#popup");


// Buttons
const logoutBtn = document.querySelector("#nav-logout");
const chatBtns = document.querySelectorAll(".chatlist-chat");
const newMatch = document.querySelector("#new-match");
const newMatchBtn = document.querySelector("#new-match-button");
const newMatchTxt = document.querySelector("#new-match h3");
const pollOptions = document.querySelectorAll(".opt");
const pollSkip = document.querySelector("#poll-skip");



// User handling
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log("user is signed in");
        landing.style.display = "none";
        main.style.display = "grid";

        // Time delay on popup 
        popup.style.display = "grid";
        setTimeout(() => {
            popup.classList.add("out");
        }, 18000)
    } else {
        // No user is signed in.
        console.log("user is not signed in");
        landing.style.display = "grid";
        main.style.display = "none";
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


// Chatting
const startChat = (e) => {
    // console.log("Start Chat", e);
    window.location = "chat.html";
};
const stopChat = (e) => {
    console.log("Stop Chat");
};


// Add chat button eventlistener
for (chatBtn of chatBtns) {
    chatBtn.addEventListener("click", (e) => {
        startChat(e);
    });
};


// Polling
let currentpoll = 0;
newMatchTxt.innerHTML = "Beantwoord meer vragen!";
newMatchBtn.classList.add("searching");
newMatchBtn.innerHTML = "cached";


// Reset polls
for (poll of polls) {
    poll.style.display = "none";
    polls[currentpoll].style.display = "grid";
};


const nextPoll = (e) => {
    // Set pollref in database
    pollRef.child(`/${auth.currentUser.uid}/${currentpoll}`).set(e.target.innerText);

    // Iterate trough poll
    polls[currentpoll].style.display = "none";
    currentpoll++;
    if (polls[currentpoll]) {
        polls[currentpoll].style.display = "grid";
    };

    // Change poll title
    if (currentpoll == 0) { pollTitle.innerHTML = "Welk dier is je favoriet?" };
    if (currentpoll == 1) { pollTitle.innerHTML = "Heb je zelf dieren?"; newMatchTxt.innerHTML = "Matches zoeken..." };
    if (currentpoll == 2) { pollTitle.innerHTML = "Waar ligt je hart?" };
    if (currentpoll == 3) {
        // Make match button active
        pollTitle.innerHTML = "De AI heeft een match voor je gevonden!";
        pollSkip.style.display = "none";
        newMatchBtn.classList.add("active");
        newMatchBtn.classList.remove("searching");
        newMatchBtn.innerHTML = "loyalty";
        newMatchBtn.addEventListener("click", (e) => {
            startChat(e);
        });
        newMatchTxt.innerHTML = "Nieuwe match!";
    };
};


// Add option eventlistener
for (option of pollOptions) {
    option.addEventListener("click", (e) => {
        nextPoll(e);
    });
};


// Add skip eventlistener
pollSkip.addEventListener("click", nextPoll);


// Button eventlisteners
landing.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);