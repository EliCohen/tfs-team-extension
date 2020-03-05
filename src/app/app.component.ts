import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ISummaryData } from './summary/summary-data.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showError = false;
  showSummary = false;
  summaryData: ISummaryData;
  errorMessage: string;
  backlogUrl: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
    await this.spinner.show();
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0].url.includes('/_backlogs/')) {
        chrome.storage.sync.get('backlogUrl', async (options) => {
          this.errorMessage = 'Works in backlog only!';
          this.backlogUrl = options.backlogUrl;
          await this.spinner.hide();
          this.showError = true;
          this.cdr.detectChanges();
        });
      } else {
        chrome.storage.sync.get('capacityPerDay', (options) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'calculate',
            capacityPerDay: options.capacityPerDay
          });
        });
      }
    });

    chrome.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        await setTimeout(async () => {
          switch (message.type) {
            case 'calculateFinish':
              this.summaryData = await this.getData(
                message.data,
                message.leftDays
              );
              await this.spinner.hide();
              this.showSummary = true;
              break;
            case 'calculateError':
              this.errorMessage = message.error;
              await this.spinner.hide();
              this.showError = true;
              break;
          }

          this.cdr.detectChanges();
        }, 250);
      }
    );
  }

  getData(data, leftDays): ISummaryData {
    let totalCommitmentsDays = 0;
    let donePbi = 0;
    let notDonePbi = 0;
    let commitmentsDaysLeft = 0;

    data.forEach((value) => {
      if (this.isPbi(value)) {
        totalCommitmentsDays += !['New', 'Approved'].includes(value.state)
          ? value.effort
          : 0;
        donePbi += value.state === 'Done' ? 1 : 0;
        notDonePbi += !['New', 'Approved', 'Done'].includes(value.state)
          ? 1
          : 0;
        commitmentsDaysLeft += !['New', 'Approved', 'Done'].includes(
          value.state
        )
          ? value.effort
          : 0;
      }
    });
    return {
      totalCommitmentsDays,
      donePbi,
      notDonePbi,
      commitmentsDaysLeft,
      teamDaysLeft: leftDays
    } as ISummaryData;
  }

  isPbi(rowData) {
    return rowData.type === 'Product Backlog Item';
  }
}
