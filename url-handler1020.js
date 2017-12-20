// inject this file to client's page to get url
let domain = window.location.hostname;
let queries = window.location.search;
let href = window.location.href;

askConfigInfo().then(pauseWeb => stopLoading(pauseWeb));

send({domain, queries}, 'url');
listen();

function askConfigInfo() {
  return new Promise((resolve, reject) => {
    send(null, 'config', function (res) {
      resolve(res.msg.pauseWeb);
    });
  });
}

function refresh(msg) {
  const newDomain = msg.domain;
  const newQueries = msg.queries;
  let newUrl = href.replace(domain, newDomain);
  if (queries) {
    newUrl = newUrl.replace(queries, newQueries)
  } else {
    newUrl = newUrl + newQueries;
  }
  document.location.href = newUrl;
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
        case 'config':
          pauseWeb = req.msg.pauseWeb;
          localStorage.setItem('pauseWeb1020', pauseWeb + '');
          sendRes(req);
      }
    }
  });
}
