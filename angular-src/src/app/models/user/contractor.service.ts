import {Injectable} from '@angular/core';
import {Contractor} from './contractor';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Details} from "../project/details/details";
import {Customer} from "./customer";
import {ApiRequestService} from "../../services/api-request.service";
import {Proposal} from "../project/proposal/proposal";

@Injectable({
  providedIn: 'root'
})
export class ContractorService {


  constructor(private apiRequestService: ApiRequestService, private materialize: Angular2MaterializeV1Service) { }

  public async retrieveContractor(): Promise<Contractor> {
    const resp = await this.apiRequestService.get('/api/retrieve-contractor');

    switch (resp.status) {
      case 200:
        return new Contractor(resp.body);
      default:
        this.materialize.toast({html: 'Url not found', displayLength: 3000});
        return new Contractor();
    }
  }

  public async retrieveProjectDetails(projectId: string): Promise<{details: Details, customer: Customer, proposal: Proposal}> {
    const resp = await this.apiRequestService.get(`/api/retrieve-project-details/${projectId}`);

    switch (resp.status) {
      case 200:
      case 201:
        return {
          details: new Details(resp.body.details),
          customer: new Customer(resp.body.owner),
          proposal: resp.body.proposals.length > 0 ? new Proposal(resp.body.proposals[0]) : undefined,
        };
      case 404:
      default:
        return { details: new Details(), customer: new Customer(), proposal: new Proposal() };
    }
  }
}
