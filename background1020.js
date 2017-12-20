// receiving client's url and and save to extension's storage, so extension can use it
chrome.runtime.onMessage.addListener(function(req, sender, sendRes) {
  if (req.type === 'url') {
    localStorage.setItem("currentDomain1020", req.msg.domain);
    localStorage.setItem("currentQueries1020", req.msg.queries);
    sendRes({
      msg: req.msg
    });
  } else if (req.type === 'config') {
    sendRes({
      msg: {pauseWeb: JSON.parse(localStorage.getItem("pauseWeb1020"))}
    });
  }
});
