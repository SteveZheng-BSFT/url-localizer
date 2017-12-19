// inject this file to client's page to get url
let domain = window.location.hostname;
let queries = window.location.search;
let href = window.location.href;
let pauseWeb = JSON.parse(localStorage.getItem('pauseWeb1020')) || false;

send(domain, queries);
listen();

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

function send(domain, queries) {
  chrome.runtime.sendMessage(
    {
      msg: {domain, queries},
      type: 'url'
    },
    function (res) {
      if (res) {
        // if send successful
        console.log(res.msg);
        if (pauseWeb) {
          window.stop();
        }
      }
    }
  );
}

function listen() {
  chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    console.log(sender.tab ? 'from contentScript' + sender.tab.url : 'from extension');
    if (req && req.type) {
      switch (req.type) {
        case 'url':
          refresh(req.msg);
          sendRes(req);
          break;
        case 'config':
          pauseWeb = req.msg.pauseWeb;
          localStorage.setItem('pauseWeb1020', pauseWeb + '');
          sendRes(req);
      }
    }
  });
}
