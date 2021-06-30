import {Injectable} from '@angular/core';
import {Project} from "../../../models/project/project";
import {Customer} from "../../../models/user/customer";

@Injectable({
  providedIn: 'root'
})
export class ProjectDashboardStateService {

  constructor() {}

  public getProjectState(customer: Customer, project: Project): 'nullProject' | 'continueProject' | 'awaitingContactInfo' | 'invitingPainters' | 'selectedPainter' {
    const progress = project.details.getProgress();

    if (progress <= 0.31)
      return 'nullProject';

    if (progress < 1)
      return 'continueProject';

    // if not received contact info
    if (!customer.hasFilledOutContactInfo() || project.status === 'creating')
      return 'awaitingContactInfo';

    if (project.selectedProposal === undefined)
      return 'invitingPainters';

    return 'selectedPainter';
  }
}
