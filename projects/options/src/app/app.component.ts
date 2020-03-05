import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Options } from './options';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  options = new Options();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    chrome.storage.sync.get(
      ['backlogUrl', 'exportEmail', 'capacityPerDay'],
      (options: Options) => {
        this.options = {
          backlogUrl: options.backlogUrl ?? '',
          exportEmail: options.exportEmail ?? '',
          capacityPerDay: options.capacityPerDay
        };
        this.cdr.detectChanges();
      }
    );
  }

  saveOptions() {
    chrome.storage.sync.set(this.options, () => {
      const notifyOptions = {
        type: 'basic',
        iconUrl: '../icon48.png',
        title: 'TFS Team Extension',
        message: 'Options has been saved!'
      };
      chrome.notifications.create('notifyOptions', notifyOptions);
    });
  }
}
