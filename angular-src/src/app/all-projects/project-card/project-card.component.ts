import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {LocalStorageService} from "../../services/local-storage.service";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProjectService} from "../../models/user/project.service";
import {Project} from "../../models/project/project";
import {IModal} from "angular2-materialize-v1/lib/IInstance";
import {emailAddressValidator} from "../../validators/emailAddress.validator";
import {ApiRequestService} from "../../services/api-request.service";
import {ResponsiveService} from "../../services/responsive.service";

@Component({
  selector: 'project-card[project]',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.less']
})
export class ProjectCardComponent implements OnInit, AfterViewInit {

  @Input() public project: Project;
  @Output() private deleteProjectClicked: EventEmitter<void>;

  public randID: string;
  public pendingOperation: boolean;
  public showCheckMark: boolean;
  public showErrorMark: boolean;
  public shareProjectFormGroup: FormGroup;
  private shareProjectModalInstance: IModal;
  private characterCounterInstance: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private materialize: Angular2MaterializeV1Service,
              private localStorageService: LocalStorageService, private router: Router,
              private apiRequestService: ApiRequestService, private formBuilder: FormBuilder,
              private projectService: ProjectService, public responsiveService: ResponsiveService) {
    this.deleteProjectClicked = new EventEmitter<void>();
    this.randID = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    this.pendingOperation = false;
    this.showCheckMark = false;
    this.showErrorMark = false;
    this.shareProjectFormGroup = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, emailAddressValidator]],
      message: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.materialize.initDropdown('.dropdown-trigger', {alignment: 'right', constrainWidth: false});
    this.materialize.initModal('#delete_project' + this.randID, {endingTop: '25%'});
    this.shareProjectModalInstance = <IModal>this.materialize.initModal('#share_project' + this.randID, {endingTop: '18%'});
    this.characterCounterInstance = this.materialize.initCharacterCount('textarea#message' + this.randID)[0];
    this.materialize.updateTextFields();
  }

  public getTitle() {
    return this.project.details.getJobDetailsAsString() + ' (' + this.project.details.getWorkDetailsAsString() + ')';
  }

  public deleteProject() {
    this.deleteProjectClicked.emit();
  }

  public continueProject() {
    const unfinishedProject: Project = this.localStorageService.getUnfinishedProject();

    if (this.project.equals(unfinishedProject)) {
      this.localStorageService.setIsEditingUnfinishedProject(true);
      this.localStorageService.saveActiveProject(unfinishedProject);
    }
    else {
      this.localStorageService.setIsEditingUnfinishedProject(false);
      this.localStorageService.saveActiveProject(this.project);
    }

    this.project.details.getProgress() === 1
      ? this.router.navigateByUrl('/project/details')
      : this.router.navigateByUrl('/details/zip-code');
  }

  public goToDashboard() {
    this.localStorageService.setIsEditingUnfinishedProject(false);
    this.localStorageService.saveActiveProject(this.project);
    this.router.navigateByUrl('/project');
  }

  public async startRequestingProposals() {
    this.pendingOperation = true;
    const resp = await this.projectService.startReceivingProposals(this.project);
    this.pendingOperation = false;

    if (resp.success) {
      this.project = resp.project;
      this.showCheckMark = true;
      setTimeout(() => {this.showCheckMark = false}, 3000);
    }
    else {
      this.showErrorMark = true;
      setTimeout(() => {this.showErrorMark = false}, 6000);
    }
  }

  public async shareProject() {
    if (!this.shareProjectFormGroup.valid) return;

    // close to show pending status
    this.shareProjectModalInstance.close();
    this.pendingOperation = true;

    const reqBody = JSON.parse(JSON.stringify(this.shareProjectFormGroup.value));
    reqBody.projectId = this.project._id;

    const resp = await this.apiRequestService.post('/api/share-project', reqBody);
    this.pendingOperation = false;

    switch (resp.status) {
      case 200:
        this.showCheckMark = true;
        this.shareProjectFormGroup.reset();
        this.materialize.updateTextFields();
        this.characterCounterInstance.updateCounter();
        setTimeout(() => {this.showCheckMark = false}, 3000);
        break;
      case 404:
        this.materialize.toast({html: 'Url Not Found'});
        this.showErrorMark = true;
        setTimeout(() => {this.showErrorMark = false}, 6000);
        break;
      default:
        this.materialize.toast({html: 'There was an error and the message was not sent.'});
        this.showErrorMark = true;
        setTimeout(() => {this.showErrorMark = false}, 6000);
        this.shareProjectModalInstance.open();
    }
  }
}
