import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../../../services/local-storage.service';
import {Details} from '../../../../models/project/details/details';
import {DetailsExteriorObject} from '../../../../models/project/details/details.exterior-object';
import {AnalyticsService} from '../../../../services/analytics.service';
import {DetailsCommunicationService} from "../../services/details-communication.service";

@Component({
  selector: 'form-details-exterior-selector',
  templateUrl: './exterior-selector.component.html',
  styleUrls: ['./exterior-selector.component.less']
})
export class ExteriorSelectorComponent implements OnInit {

  public details: Details;
  public exteriorStructures: Array<any>;


  constructor(public localStorageService: LocalStorageService, private detailsCommunicationService: DetailsCommunicationService, private analytics: AnalyticsService) {
    this.details = localStorageService.getProjectDetails();
    this.exteriorStructures = [
      { title: 'House', type:'house', selected: false },
      { title: 'Detached Garage', type:'detachedGarage', selected: false },
      { title: 'Shed', type:'shed', selected: false },
    ];

    let newExterior = [];
    for (let structure of this.details.exterior) {
      if (structure.type !== 'deck') {
        newExterior.push(structure);
      }
    }
    this.details.exterior = newExterior;

    for (let structure of this.details.exterior) {
      for (let s of this.exteriorStructures) {
        if (structure.type === s.type) {
          s.selected = true;
        }
      }
    }

    this.detailsCommunicationService.setProgress(this.details);
    this.validateForm();
  }

  ngOnInit() {
    const details = this.analytics.eventAction.project.stepViewed;
    details.label.value = 'exterior_selector';
    this.analytics.pageAction(details);
  }

  public selectStructure(index: number) {
    this.exteriorStructures[index].selected = !this.exteriorStructures[index].selected;

    if (this.exteriorStructures[index].selected) {
      let structure = new DetailsExteriorObject();
      structure.defaultName = this.exteriorStructures[index].title;
      structure.type = this.exteriorStructures[index].type;
      this.details.exterior.push(structure);
    } else {
      this.details.exterior = this.details.exterior.filter(
        structure => structure.type !== this.exteriorStructures[index].type
      );
    }

    const details = this.analytics.eventAction.project.updated;
    details.label.value = 'exterior_selector';
    this.analytics.pageAction(details);

    this.validateForm();
  }

  public validateForm(): void {
    const valid = this.details.exterior.length > 0;
    this.detailsCommunicationService.formEvent(this.details, valid);
  }
}
