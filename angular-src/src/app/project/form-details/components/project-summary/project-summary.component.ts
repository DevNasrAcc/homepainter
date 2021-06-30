import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {Details} from "../../../../models/project/details/details";
import {AnalyticsService} from '../../../../services/analytics.service';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";

@Component({
  selector: 'form-details-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.less']
})
export class ProjectSummaryComponent implements OnInit, AfterViewInit {

  public details: Details;
  public charLen: number;
  public valid: boolean;
  public wordLen: number;

  constructor(private analytics: AnalyticsService, public localStorageService: LocalStorageService,
              private detailsCommunicationService: DetailsCommunicationService, private materialize: Angular2MaterializeV1Service)
  {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.validateForm();
  }

  ngOnInit() {
    this.updateCharsRemaining();
  }

  ngAfterViewInit(){
    this.materialize.updateTextFields();
  }

  public updateCharsRemaining() {
    this.charLen = this.details.additionalDetailsComment.length;
    this.localStorageService.saveProjectDetails(this.details);
    this.updateWordsRemaining();
    this.validateForm();
  }

  public updateWordsRemaining() {
    const wordArray = this.details.additionalDetailsComment.trim().split(" ");
    this.wordLen = wordArray.length;

    for(let i = 0; i < wordArray.length; i++){
      if(wordArray[i] === ""){
        this.wordLen = this.wordLen - 1;
      }
    }
  }

  public trackPageAction() {
    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'additional_details';
    this.analytics.pageAction(details);
  }

  private validateForm(): void {
    this.valid = this.details.validateAdditionalComment();
    this.detailsCommunicationService.formEvent(this.details, this.valid);
  }

}
