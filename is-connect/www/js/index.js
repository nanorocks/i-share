const appStatus = document.getElementById("appStatus");

function appStatusMsg(status = 0) {
  let msg = 'Not connected ...';
  switch (status) {
    case 1:
      msg = "Connected !!!";
      break;
    case 2:
      msg = "Connection closed !!!";
      break;
    case 3:
      msg = "Connecting ...";
      break;
    default:
      break;
  }

  return msg;
}

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

function join(peerID) {
  
  appStatus.innerHTML = appStatusMsg(3);
  console.log("join", peerID);
  alert(123123);
  // Close old connection
  if (conn) {
    conn.close();
  }

  document.getElementById("pir-conn").value = peerID;
  // Create connection to destination peer specified in the input field
  conn = peer.connect(peerID, {
    reliable: true,
  });

  conn.on("open", function () {
    console.log("Connected to: " + conn.peer);

    setTimeout(() => {
      appStatus.innerHTML = appStatusMsg(1);
      appStatus.classList.remove('bg-dark');
      appStatus.classList.add("bg-success");
    }, 1000);
    
    // TODO get all mobile URLS from local storage and send to pc
    conn.send("All mobile URLS from local storage");
  });

  // Handle incoming data (messages only since this is the signal sender)
  conn.on("data", function (data) {
    // Mobile receives here data from pc
    console.log("MESSAGE from pc", data);
  });

  conn.on("close", function () {
    console.log("Connection closed");

    appStatus.classList.remove("bg-success");
    appStatus.classList.add("bg-dark");
    appStatus.innerHTML = appStatusMsg(2) ;

    setTimeout(() => {
      appStatus.innerHTML = appStatusMsg();
    }, 1000);
  });
}


init();

var html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});

html5QrcodeScanner.render(function (decodedText, decodedResult) {
  console.log(`Scan result: ${decodedText}`, decodedResult);
  html5QrcodeScanner.clear();
  join(decodedText);
  // show input and btn for disconnect
});


/**
 * Disconnect p2p button 
 */
document.getElementById("disconnect-btn").addEventListener("click", function () {
  // close p2p connection
  
  // hide input and button
});
