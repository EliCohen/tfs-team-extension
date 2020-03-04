import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ISummaryData } from './summary-data.interface';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SummaryComponent implements OnInit {
  @Input() data: ISummaryData;
  progressBarValue: number;

  constructor() {}

  ngOnInit(): void {
    if (this.data.commitmentsDaysLeft === 0) {
      this.progressBarValue = 100;
    } else {
      this.progressBarValue = Math.min(
        100 - Math.floor(
          (this.data.commitmentsDaysLeft / this.data.totalCommitmentsDays) * 100
        ),
        100
      );
    }
  }
}
