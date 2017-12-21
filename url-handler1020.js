// inject this file to client's page to get url
let queries = window.location.search;
let nonQueries = window.location.protocol + '//' + window.location.host + window.location.pathname;

askConfigInfo().then(pauseWeb => stopLoading(pauseWeb));

send({nonQueries, queries}, 'url');
listen();

function askConfigInfo() {
  return new Promise((resolve, reject) => {
    send(null, 'config', function (res) {
      resolve(res.msg.pauseWeb);
    });
  });
}

function refresh(msg) {
  window.location.assign(msg.nonQueries + msg.queries);
}

function send(msg, type, callback) {
  chrome.runtime.sendMessage(
    {
      msg: msg,
      type
    },
    function (res) {
      if (res) {
        // if send successful
        console.log(res.msg);
        if (callback) {
          callback(res);
        }
      }
    }
  );
}

function stopLoading(pauseWeb) {
  if (pauseWeb) {
    window.stop();
  }
}

function listen() {
  chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    console.log(sender.tab ? 'from contentScript' + sender.tab.url : 'from extension' + req);
    if (req && req.type) {
      switch (req.type) {
        case 'url':
          sendRes(req);
          refresh(req.msg);
          break;
      }
    }
  });
}
