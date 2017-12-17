// inject this file to client's page to get url
let domain = window.location.hostname;
let queries = window.location.search;
let href = window.location.href;

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
      result: 1
    },
    function (res) {
      if (res) {
        console.log(res.msg)
      }
    }
  );
}

function listen() {
  chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    console.log(sender.tab ? 'from contentScript' + sender.tab.url : 'from extension');
    if (req && req.result) {
      switch (req.result) {
        case 1:
          refresh(req.msg);
          break;
      }
    }
  });
}
