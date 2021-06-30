import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {environment} from '../../../environments/environment';
import {Customer} from './customer';
import {GlobalImageService} from "../../services/global-image.service";
import {AnalyticsService} from "../../services/analytics.service";
import {ChargeDetails} from "../charge-details";
import {Project} from "../project/project";
import {ApiRequestService} from "../../services/api-request.service";
import {Contractor} from "./contractor";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient, private materialize: Angular2MaterializeV1Service, private analytics: AnalyticsService,
              private globalImageService: GlobalImageService, private apiRequestService: ApiRequestService) {
  }

  public async saveProgress(project: Project, final: boolean): Promise<{ success: boolean, project: Project }> {
    return await this.save(
      project,
      final ? '/api/save-progress' : '/api/save-partial-progress',
      undefined,
      'There was an error saving your progress.'
    );
  }

  public async saveAndReturnLater(project: Project): Promise<{ success: boolean, project: Project }> {
    return await this.save(
      project,
      '/api/save-and-return',
      'We have saved your progress and are sending you an email to return to your project!',
      'There was an error saving your progress. Please check all fields and try again.'
    );
  }

  public async startReceivingProposals(project: Project): Promise<{ success: boolean, project: Project }> {
    if (environment.angularServe) {
      project.status = 'invitingPainters';
    }

    const ret = await this.save(
      project,
      '/api/start-receiving-proposals',
      undefined,
      'There was an error inviting the painters. If this issue persists, please email us at support@thehomepainter.com.'
    );
    return ret;
  }

  public async invitePainter(contractorId: string, project: Project, message: string = 'Hi, I would like to invite you to quote my project.'): Promise<{ success: boolean, project: Project }> {
    if (environment.angularServe) {
      await (() => new Promise(resolve => setTimeout(resolve, 2000)))();
      project.invitedContractors.push(contractorId);
      return {success: true, project: project};
    }

    const resp = await this.apiRequestService.post('/api/invite-painter', {
      contractorId: contractorId,
      projectId: project._id,
      message: message
    });

    switch (resp.status) {
      case 200:
      case 201:
        return { success: true, project: new Project(resp.body) }
      default:
        this.materialize.toast({html: 'Error inviting painter with id ' + contractorId});
        return { success: false, project: project }
    }
  }

  public async submitGeneralFeedback(event: { value: any, cb: Function }) {
    try {
      if (environment.angularServe) {
        await (function () {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('dev')
            }, 1000);
          });
        })();
      }

      await this.http.post<any>('/api/general-feedback', event.value).toPromise();
      this.materialize.toast({
        html: 'We have received your response! Thank you for your feedback!',
        displayLength: 12000
      });
      event.cb(true);
      return true;
    } catch (e) {
      console.log(e);
      this.materialize.toast({
        html: 'There was an issue submitting your feedback. If you feel there is an error, please contact us at: ' +
          '<a href=\'mailto:support@homepainter.com\'>support@homepainter.com</a>',
        displayLength: 6000
      });
      event.cb(false);
      return false;
    }
  }

  public async getChargeDetails(customer: Customer, project: Project): Promise<ChargeDetails> {
    if (!customer.hasFilledOutContactInfo() || !project.details.isValid() || environment.angularServe) {
      await (() => {
        return new Promise(r => setTimeout(r, 1500))
      })();
      return new ChargeDetails();
    }

    try {
      const chargeDetails = await this.http.post<any>('/api/get-charge-details', project).toPromise();
      return new ChargeDetails(chargeDetails);
    } catch (e) {
      console.log(e);
      this.materialize.toast({html: 'There was a problem getting the charge details.', displayLength: 6000});
      return new ChargeDetails();
    }
  }

  private async save(project: Project, url: string, successMsg: string, errorMsg: string): Promise<{ success: boolean, project: Project }> {
    if (environment.angularServe) {
      this.materialize.toast({html: 'Development environment'});
      return {success: true, project: project};
    }

    try {
      const resp = await this.http.post(url, project).toPromise<any>();

      if (successMsg)
        this.materialize.toast({html: successMsg});

      return {success: true, project: new Project(resp)};
    } catch (e) {
      this.materialize.toast({html: errorMsg});
      return {success: false, project: project};
    }
  }

  public async upgradeProjectSchema(project: Project): Promise<Project> {
    const resp = await this.apiRequestService.post('/api/upgrade-project-schema', project);
    switch (resp.status) {
      case 200:
        return new Project(resp.body);
      case 404:
        return new Project();
      default:
        this.materialize.toast({html: 'There was a problem loading your project information.', displayLength: 6000});
        return new Project();
    }
  }
}
