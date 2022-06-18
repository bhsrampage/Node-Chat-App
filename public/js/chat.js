const socket = io();

//Elements
const $msgForm = document.querySelector("form");
const $msgFormInput = $msgForm.querySelector("input");
const $msgFormButton = $msgForm.querySelector("button");
const $sendLocButton = document.querySelector("#location");
const $messages = document.querySelector("#messages");
const $sideBar = document.querySelector("#side-bar");
const $menuButton = document.querySelector(".side_bar_toggle");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML; //accessing html elements inside script tag
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

var isOpen = false;
//Listners
$menuButton.addEventListener("click", () => {
  isOpen = !isOpen;
  $sideBar.style.width = isOpen ? "75%" : "0px";
  isOpen
    ? $menuButton.classList.add("open")
    : $menuButton.classList.remove("open");
  // $menuButton.innerHTML = isOpen
  //   ? '<i class="fa-solid fa-xmark"></i>'
  //   : '<i class="fa-solid fa-bars"></i>';
});

// $(document).ready(function () {
//   $("#nav-icon1").click(function () {
//     $(this).toggleClass("open");
//   });
// });

function buttonChanger(x) {
  if (x.matches) {
    $msgFormButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    $sendLocButton.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
  }
}
//Media Queries
var x = window.matchMedia("(max-width: 40em)");
x.addEventListener("change", buttonChanger);
buttonChanger(x);

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New Message Element
  const $newMessage = $messages.lastElementChild; //Get the lastest elemnt in it

  //Get height of the new Message
  const newMessageStyles = getComputedStyle($newMessage);
  const marigin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + marigin;

  //Visible Height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages Container
  const containerHeight = $messages.scrollHeight;

  //How far scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight; //Scroll To Bottom
  }
};

const renderMessage = (msg, isloc) => {
  //console.log(msg);
  const html = Mustache.render(isloc ? locationTemplate : messageTemplate, {
    msg: msg.text,
    time: moment(msg.createdAt).format("h:mm a"),
    username: msg.name,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
};

$msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $msgFormButton.setAttribute("disabled", "disabled");
  let val = $msgFormInput.value;
  socket.emit("outMsg", val, (stat) => {
    //enable
    $msgFormButton.removeAttribute("disabled", "disabled");
    $msgFormInput.focus();
    //console.log(`Message status:- ${stat}`); //the arraw function is used for acknowledgement
  });
  $msgFormInput.value = "";
  $msgFormInput.focus = false;
});

$sendLocButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation unsupported :(");
  }
  $sendLocButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((p) => {
    socket.emit(
      "sendLocation",
      {
        lat: p.coords.latitude,
        long: p.coords.longitude,
      },
      (stat) => {
        $sendLocButton.removeAttribute("disabled", "disabled");
        //console.log(`Location status:- ${stat}`); //the arraw function is used for acknowledgement
      }
    );
    //console.log("Sent Location");
  });
});

socket.on("message", (msg) => {
  //console.log(msg);
  renderMessage(msg);
});

socket.on("recLoc", (msg) => {
  renderMessage(msg, true);
  // console.log(msg);
  // const html = Mustache.render(locationTemplate, {
  //   link: msg.text,
  //   time: moment(msg.createdAt).format("h:mm a"),
  // });
  // $messages.insertAdjacentHTML("beforeend", html);
});
socket.on("inMsg", (msg) => {
  renderMessage(msg);
  // console.log(msg);
  // const html = Mustache.render(messageTemplate, {
  //   msg: msg.text,
  //   time: moment(msg.createdAt).format("h:mm a"),
  // });
  // $messages.insertAdjacentHTML("beforeend", html);
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomdata", (room) => {
  //console.log(room);
  const html = Mustache.render(sideBarTemplate, {
    room: room.name,
    users: room.usersList,
  });

  $sideBar.innerHTML = html;
});
