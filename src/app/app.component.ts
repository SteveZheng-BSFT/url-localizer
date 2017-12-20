import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  params: {key: string, value: string, foundK?: boolean, foundV?: boolean}[] = [];
  pauseWeb: boolean;
  searchText: string;
  @ViewChild('plainText') plainText: ElementRef;

  ngOnInit() {
    this.editable = true;
    this.instruction = 'Copy All';
    this.pauseWeb = JSON.parse(localStorage.getItem('pauseWeb1020')) || false;
    this.setParams();
  }

  setParams() {
    const domain = localStorage.getItem('currentDomain1020') || '';
    const queries = localStorage.getItem('currentQueries1020');
    this.params.push({
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
            localStorage.setItem('pauseWeb1020', false + '');
            window.close();
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
        key: '',
        value: ''
      }
    );
  }

  deleteParam(index: number) {
    this.params.splice(index, 1);
  }

  copyText() {
    // select
    window.getSelection().selectAllChildren(this.plainText.nativeElement);
    // copy
    const success = document.execCommand('copy');
    this.instruction = success ? 'Copied !' : 'Try Again';
    setTimeout(() => this.instruction = 'Copy All', 1500);
  }

  saveConfig(pauseWeb: boolean) {
    this.pauseWeb = pauseWeb;
    localStorage.setItem('pauseWeb1020', this.pauseWeb + '');
  }

  search(input: string) {
    this.searchText = input;
    if (!input) {
      return;
    }
    this.params.forEach(param => {
      param.foundK = param.key.includes(input);
      param.foundV = param.value.includes(input);
    });

  }
}
