var qrcode = new QRCode(document.getElementById("qrcode"), {
  width: 128,
  height: 128,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H,
});

document.getElementById("qrcode").style = "display:none";
document.getElementById("msg").style = "display:none";

document.getElementById("urlToQrCode").addEventListener("click", function () {
  qrcode.clear();
  // document.getElementById("qrcode").style = "display:none";
  document.getElementById("msg").style = "display:block";
  setTimeout(function (params) {
    document.getElementById("msg").style = "display:none";
    document.getElementById("qrcode").style = "display:block";
    // Code for extension
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let url = tabs[0].url;
      // use `url` here inside the callback because it's asynchronous!
      qrcode.makeCode(url); // current open tab url !!!
    });
  }, 1000);
});

document
  .getElementById("clearQrCodeWindow")
  .addEventListener("click", function () {
    document.getElementById("qrcode").style = "display:none";
    document.getElementById("msg").style = "display:none";
  });

var lastPeerId = null;
var peer = null; // Own peer object
var peerId = null;
var conn = null;

function init() {
  const peer = new Peer(null, {
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
    console.log("Awaiting connection...");

    var qrcodeid = new QRCode(document.getElementById("qrcodeid"), {
      width: 128,
      height: 128,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    qrcodeid.makeCode(peer.id);
    document.getElementById("conn-id").innerHTML = peer.id;
  });

  peer.on("connection", function (c) {
    // Allow only a single connection
    if (conn && conn.open) {
      c.on("open", function () {
        c.send("Already connected to another client");
        setTimeout(function () {
          c.close();
        }, 500);
      });
      return;
    }

    conn = c;
    console.log("Connected to: " + conn.peer);
    console.log("status " + "Connected");

    ready();
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
    console.log("Error ", err);
  });
}

function ready() {
  conn.on("data", function (data) {
    console.log("Data recieved");
    console.log("DATA", data);
  });

  conn.on("close", function () {
    console.log("Connection reset, Awaiting connection...");
    conn = null;
  });

  conn.send("Hello from pc!");
}

init();

document
  .getElementById("sendAllOpenTabs")
  .addEventListener("click", function () {
    // Send messages
    if (conn && conn.open) {
      conn.send("Please work !!!");
    } else {
      console.log("Connection is closed");
    }

    // chrome.tabs.query({ }, (tabs) => {
    //   var tabsArr = []
    //   tabs.forEach(tab => {
    //       tabsArr.push(tab.url);
    //   });

    //   // use `url` here inside the callback because it's asynchronous!
    // });
  });
