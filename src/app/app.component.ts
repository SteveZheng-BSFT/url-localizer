import { Component, OnInit } from '@angular/core';
// syntax to avoid error by typescript for non-exist lib
declare var chrome;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  editable: boolean;
  instruction: string;
  params: {id: string, key: string, value: string}[] = [];
  pauseWeb: boolean;

  ngOnInit() {
    this.editable = true;
    this.instruction = 'Copy All';
    this.pauseWeb = JSON.parse(localStorage.getItem('pauseWeb1020')) || false;
    this.setParams();
  }

  setParams() {
    const domain = localStorage.getItem('currentDomain1020');
    const queries = localStorage.getItem('currentQueries1020');
    this.params.push({
      id: '1',
      key: 'domain',
      value: domain
    });
    if (queries) {
      // ?asdf=asdf&sdf=ggas
      queries.slice(1).split('&').forEach(pair => {
        const params = pair.split('=');
        const key = params[0];

        let value = '';
        // deal the situation: ?badquery&good=query
        try {
          value = params[1];
        } catch (e) {
        }
        this.params.push({
          id: Math.random() + '',
          key,
          value
        });
      });
    }
  }

  submit() {
    // use params to get domain and queries
    const domain = this.params.find(param => param.key === 'domain').value;
    let queries = '?';
    this.params.forEach(param => {
      if (param.key !== 'domain' && param.key && param.value) {
        queries += param.key + '=' + param.value + '&';
      }
    });
    // omit last &
    queries = queries.slice(0, queries.length - 1);
    // send
    this.sendMessage({domain, queries}, 'url');
  }

  sendMessage(msg: any, type: string) {
    if (chrome) {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const obj = {
          msg: msg,
          type
        };
        chrome.tabs.sendMessage(tabs[0].id, obj, function (res) {
          if (res && res.type === 'url') {
            console.log('sent');
            localStorage.removeItem('currentDomain1020');
            localStorage.removeItem('currentQueries1020');
          }
        });
      });
    }
  }

  toggle() {
    this.editable = !this.editable;
  }

  addPair() {
    this.params.splice(1, 0,
      {
        id: Math.random() + '',
        key: '',
        value: ''
      }
    );
  }

  deleteParam(index: number) {
    this.params.splice(index, 1);
  }

  copyText() {
    this.instruction = 'Copied !';
    setTimeout(() => this.instruction = 'Copy All', 1500);
  }

  saveConfig(pauseWeb: boolean) {
    this.pauseWeb = pauseWeb;
    localStorage.setItem('pauseWeb1020', this.pauseWeb + '');
    this.sendMessage({pauseWeb}, 'config');
  }
}
