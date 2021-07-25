var html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});

function onScanSuccess(decodedText, decodedResult) {
  // Handle on success condition with the decoded text or result.
  console.log(`Scan result: ${decodedText}`, decodedResult);
  // ...
  html5QrcodeScanner.clear();
  // ^ this will stop the scanner (video feed) and clear the scan area.
}

html5QrcodeScanner.render(onScanSuccess);

const contentBlock = document.getElementById("content-block");
const spinner = document.getElementById("spinner");

setTimeout(() => {
  contentBlock.classList.remove("d-none");
  spinner.classList.add("d-none");
}, 20);

var lastPeerId = null;
var peer = null; // own peer object
var conn = null;

function init() {
  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(null, {
    host: "localhost",
    port: 9000,
    path: "/myapp",
  });

  peer.on("open", function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
      console.log("Received null id from peer open");
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }

    console.log("ID: " + peer.id);
  });

  peer.on("connection", function (c) {
    // Disallow incoming connections
    c.on("open", function () {
      c.send("Sender does not accept incoming connections");
      setTimeout(function () {
        c.close();
      }, 500);
    });
  });

  peer.on("disconnected", function () {
    console.log("Connection lost. Please reconnect");

    // Workaround for peer.reconnect deleting previous id
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
  });

  peer.on("close", function () {
    conn = null;
    console.log("Connection destroyed");
  });

  peer.on("error", function (err) {
    console.log("Error " + err);
  });
}

function join() {
  // Close old connection
  if (conn) {
    conn.close();
  }
  // Create connection to destination peer specified in the input field
  conn = peer.connect(document.getElementById("pir-conn").value, {
    reliable: true,
  });

  conn.on("open", function () {
    console.log("Connected to: " + conn.peer);
    // Check URL params for comamnds that should be sent immediately
    conn.send("Message from mobile");
  });

  // Handle incoming data (messages only since this is the signal sender)
  conn.on("data", function (data) {
    // Mobile receives here data from pc
    console.log("MESSAGE from pc", data);
  });

  conn.on("close", function () {
    console.log("Connection closed");
  });
}

init();
document.getElementById("pir-btn").addEventListener("click", () => join());
