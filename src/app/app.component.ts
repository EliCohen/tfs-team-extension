import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'tfs-team-extension';

  ngOnInit(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0].url.includes('/_backlogs/')) {
        this.setError('You need to be in the backlog page!');
      } else {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'calculate'
        });
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'calculateFinish':
          setTimeout(() => this.setData(message.data, message.leftDays), 300);
          break;
        case 'calculateError':
          this.setError(message.error);
          break;
      }
    });
  }

  setData(data, leftDays) {
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

    $('#totalCommitmentsDays .totalValue').text(
      totalCommitmentsDays > 0 ? totalCommitmentsDays : 'None'
    );
    $('#donePbi .totalValue').text(donePbi > 0 ? donePbi : 'None');
    $('#notDonePbi .totalValue').text(notDonePbi > 0 ? notDonePbi : 'None');
    $('#commitmentsDaysLeft .totalValue').text(
      commitmentsDaysLeft > 0 ? commitmentsDaysLeft : 'None'
    );
    $('#teamDaysLeft .totalValue').text(leftDays > 0 ? leftDays : 'None');

    if (commitmentsDaysLeft > leftDays) {
      $('#commitmentsDaysLeft .totalValue').addClass('redValue');
    } else {
      $('#commitmentsDaysLeft .totalValue').addClass('greenValue');
    }

    this.removeLoading();
    $('.summary-container').removeClass('hidden');
  }

  setError(error) {
    $('.error-container #error').text(error);
    this.removeLoading();
    $('.error-container').removeClass('hidden');
  }

  isPbi(rowData) {
    return rowData.type === 'Product Backlog Item';
  }

  removeLoading() {
    $('.loading-container').addClass('hidden');
  }

  showLoading() {
    $('.loading-container').removeClass('hidden');
  }
}
