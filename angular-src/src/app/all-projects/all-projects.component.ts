import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../services/local-storage.service';
import {Router} from '@angular/router';
import {Project} from '../models/project/project';
import {environment} from '../../environments/environment';
import {HttpResponse} from '@angular/common/http';
import {ApiRequestService} from '../services/api-request.service';

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.less']
})
export class AllProjectsComponent implements OnInit, AfterViewInit {

  public unfinishedProject: Project;
  public activeProject: Project;
  public projects: Array<Project>;

  constructor(private localStorageService: LocalStorageService, private router: Router,
              private apiRequestService: ApiRequestService)
  {
    this.unfinishedProject = localStorageService.getUnfinishedProject();
    this.activeProject = localStorageService.getActiveProject();
    this.projects = [];
  }

  async ngOnInit(): Promise<void> {
    let resp;
    if (environment.angularServe) {
      await new Promise((res) => setTimeout(res, 1000));
      const exampleProject = {
        __v: 0,
        details: {
          address: {
            streetAddress: '',
            city: '',
            state: '',
            zipCode: 50014
          },
          jobType: 'house',
          decorType: 'interior',
          paintSupplier: 'painter',
          paintBrand: '',
          paintProduct: '',
          timeFrameStart: 'flexibleStartDate',
          timeFrameEnd: 'flexibleEndDate',
          expectedEndDate: null,
          occupancy: 'furnishedAndOccupied',
          interior: [
            {
              defaultName: 'Living Room 1',
              type: 'livingRoom',
              size: {
                name: 'large',
                length: 20,
                width: 20,
                label: '15\'x15\' to 20\'x20\''
              },
              height: {
                name: 'vaulted',
                height: 17,
                label: '15\' to 17\''
              },
              photos: [],
              items: [
                {
                  additionalDetails: {
                    conditions: [],
                    amount: 0,
                    ceilingType: '',
                    cabinetGrainType: '',
                    cabinetTreatment: '',
                    numberOfCabinetDrawers: 0,
                    numberOfCabinetDoors: 0,
                    cabinetCondition: ''
                  },
                  type: 'fireplaceMantel',
                }
              ],
            }
          ],
          exterior: [],
          additionalDetailsComment: 'f f f f f',
        },
        invitedContractors: [],
        owner: {},
        promoCode: '',
        status: 'invitingPainters',
      };
      resp = new HttpResponse<any>({status: 200, body: [exampleProject, exampleProject]});
    } else {
      resp = await this.apiRequestService.get('/api/retrieve-all-projects');
    }

    for (let i = 0; resp.status === 200 && i < resp.body.length; ++i) {
      this.projects.push(new Project(resp.body[i]));
    }
  }

  ngAfterViewInit(): void {
  }

  public startNewProject() {
    this.localStorageService.setIsEditingUnfinishedProject(true);
    this.localStorageService.saveActiveProject(new Project());
    this.router.navigateByUrl('/details/zip-code');
  }

  public onDeleteProjectClicked() {
    const newProject = new Project();
    this.unfinishedProject = newProject;

    if (this.localStorageService.getIsEditingUnfinishedProject()) {
      this.localStorageService.saveActiveProject(newProject);
    } else {
      this.localStorageService.saveUnfinishedProject(newProject);
    }
  }
}
