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
    const nonQueries = localStorage.getItem('currentNonQueries1020') || '';
    const queries = localStorage.getItem('currentQueries1020');
    this.params.push({
      key: 'Non-Queries',
      value: nonQueries
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
    // use params to get non queries part
    let nonQueries = this.params.find(param => param.key === 'Non-Queries').value;
    // add http(s) if user didn't add it because location.href can't refresh w/o protocol
    nonQueries = this.processProtocol(nonQueries);
    const queries = this.constructQueries();
    // send
    this.sendMessage({nonQueries, queries}, 'url');
  }

  private processProtocol(nonQueries): string {
    if (!nonQueries.includes('http')) {
      const addedProtocol = localStorage.getItem('currentNonQueries1020').search(/http(s)?:/);
      if (addedProtocol) {
        return addedProtocol + '//' + nonQueries;
      } else {
        return 'http://' + nonQueries;
      }
    } else {
      return nonQueries;
    }
  }

  constructQueries(): string {
    let queries = '?';
    this.params.forEach(param => {
      if (param.key !== 'Non-Queries' && param.key && param.value) {
        queries += param.key + '=' + param.value + '&';
      }
    });
    // omit last '&' or single '?'
    return queries.slice(0, queries.length - 1);
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
    // assign back here because in template, empty string shouldn't highlight div
    this.searchText = input;
    if (!input) {
      return;
    }
    input = input.toLowerCase();
    this.params.forEach(param => {
      param.foundK = param.key.toLowerCase().includes(input);
      param.foundV = param.value.toLowerCase().includes(input);
    });

  }
}
