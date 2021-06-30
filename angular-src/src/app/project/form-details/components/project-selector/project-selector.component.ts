import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsCommunicationService} from '../../services/details-communication.service';
import {DetailsExteriorObject} from "../../../../models/project/details/details.exterior-object";

@Component({
  selector: 'form-details-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.less']
})
export class ProjectSelectorComponent implements OnInit {

  public details: Details;

  constructor(public localStorageService: LocalStorageService, private detailsCommunicationService: DetailsCommunicationService, private analytics: AnalyticsService) {
    this.details = localStorageService.getProjectDetails();
    this.detailsCommunicationService.setProgress(this.details);
    this.validateForm(false);
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'project_selector';
    this.analytics.pageAction(details);
  }

  changeProjectSelection(typeOfProject): void {
    if (typeOfProject === 'exterior'){
      this.details.interior = [];
      this.details.exterior = this.details.exterior.filter(structure => structure.type !== 'deck');
    } else if (typeOfProject === 'deck') {
      this.details.interior = [];
      this.details.exterior = this.details.exterior.filter(structure => structure.type === 'deck');
      if (this.details.exterior.length === 0) {
        this.details.exterior.push(new DetailsExteriorObject({
          defaultName: 'Deck',
          type: 'deck'
        }));
      }
    } else if (typeOfProject === 'interior') {
      this.details.exterior = [];
    }

    this.details.decorType = typeOfProject !== 'deck' ? typeOfProject : 'exterior';
    this.validateForm(true);
  }

  private validateForm(forceNavigate?: boolean): void {
    const valid = this.details.validateDecorType();

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'project_selector';
    this.analytics.pageAction(details);

    this.detailsCommunicationService.formEvent(this.details, valid, forceNavigate);
  }
}
