import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  @Input() error: string;
  @Input() backlogUrl: string;
  constructor() {}

  goToBacklog() {
    chrome.tabs.update({ url: this.backlogUrl });
    window.close();
  }
}
