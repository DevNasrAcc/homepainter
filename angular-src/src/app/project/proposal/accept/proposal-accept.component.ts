import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {Details} from '../../../models/project/details/details';
import {AnalyticsService} from '../../../services/analytics.service';
import {Contractor} from "../../../models/user/contractor";
import {ContractorService} from "../../../models/user/contractor.service";
import {LocalStorageService} from "../../../services/local-storage.service";
import {BannerService} from "../../../libraries/banner/banner.service";
import {MessageService} from "../../../services/message.service";
import {Customer} from "../../../models/user/customer";
import {IModal} from "angular2-materialize-v1/lib/IInstance";
import {ApiRequestService} from "../../../services/api-request.service";
import {Proposal} from "../../../models/project/proposal/proposal";


@Component({
  selector: 'root-contractor-response',
  templateUrl: './proposal-accept.component.html',
  styleUrls: ['./proposal-accept.component.less']
})
export class ProposalAcceptComponent implements OnInit, AfterViewInit, OnDestroy {

  private resp500: any;
  private sendMessageModal: IModal;
  private missingProjectDetailsBanner: any;
  private earliestStartDateInstance: any;

  public customer: Customer;
  public details: Details;
  public proposal: Proposal;
  public contractor: Contractor;
  public contractorProposalFormGroup: FormGroup;
  public sendMessageModalForm: FormGroup;
  public submitting: boolean;
  public submitted: boolean;
  public messageCharacterCounter: any;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router,
              private materialize: Angular2MaterializeV1Service, private apiRequestService: ApiRequestService,
              private analytics: AnalyticsService, private contractorService: ContractorService,
              private localStorageService: LocalStorageService, private bannerService: BannerService,
              private messageService: MessageService) {
    this.submitting = false;
    this.contractor = this.localStorageService.getContractor();
    const fieldsDisabled = this.contractor.accountStatus === 'restricted';
    this.contractorProposalFormGroup = formBuilder.group({
      price: [{
        value: '',
        disabled: fieldsDisabled
      }, [Validators.required, Validators.pattern(/^([0-9]+|[0-9]+.[0-9]{1,2}|.[0-9]{1,2})$/)]],
      message: [{value: '', disabled: fieldsDisabled}, [Validators.maxLength(350)]],
      earliestStartDate: [{value: '', disabled: fieldsDisabled}, [Validators.required]],
    });
    this.sendMessageModalForm = formBuilder.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.customer = new Customer();
    this.details = new Details();
    this.proposal = undefined;
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    const date = new Date();
    this.sendMessageModal = <IModal>this.materialize.initModal('#send_message_modal', { endingTop: '30%' });
    this.earliestStartDateInstance = this.materialize.initDatepicker('#earliestStartDate', {
      minDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      autoClose: true,
    });

    this.resp500 = this.bannerService.init('#resp500');
    this.missingProjectDetailsBanner = this.bannerService.init('#missingProjectDetailsBanner');

    const projectId = this.activatedRoute.snapshot.params.projectId;
    const resp = await this.contractorService.retrieveProjectDetails(projectId);
    this.details = resp.details;
    this.customer = resp.customer;
    this.proposal = resp.proposal;
    if (!this.details.isValid()) this.missingProjectDetailsBanner.open();
    if (this.proposal) {
      this.contractorProposalFormGroup.get('price').setValue(String(this.proposal.price));
      this.contractorProposalFormGroup.get('price').clearValidators();
      this.contractorProposalFormGroup.get('message').setValue(this.proposal.message);
      this.contractorProposalFormGroup.get('message').markAsTouched();
      this.contractorProposalFormGroup.get('earliestStartDate').setValue(this.proposal.earliestStartDate);
      this.contractorProposalFormGroup.get('earliestStartDate').markAsTouched();
      this.contractorProposalFormGroup.disable();
      this.submitted = true;
    }

    this.messageCharacterCounter = this.materialize.initCharacterCount('#message');
    this.materialize.updateTextFields();
  }

  ngOnDestroy(): void {
    this.bannerService.destroyAll();
    this.messageCharacterCounter.destroy();
  }

  public decline(): void {
    const projectId = this.activatedRoute.snapshot.params.projectId;
    this.router.navigate(['/decline-project', projectId]);
  }

  public onSelectedEarliestDate(evt){
    this.contractorProposalFormGroup.get('earliestStartDate').setValue(evt.target.value);
  }

  public async sendMessage() {
    if (this.sendMessageModalForm.invalid || this.sendMessageModalForm.disabled)
      return;

    if (this.resp500.isOpen) this.resp500.close();
    if (this.missingProjectDetailsBanner.isOpen) this.missingProjectDetailsBanner.close();
    this.sendMessageModalForm.disable();
    const resp = await this.messageService.sendMessage(this.customer, this.sendMessageModalForm.get('message').value);

    if (resp.status === 200 || resp.status === 201) {
      this.messageService.setSelectedConversation(this.customer._id);
      this.router.navigateByUrl('/messages');
    }
    else {
      this.sendMessageModal.close();
      this.resp500.open();
      this.sendMessageModalForm.enable();
    }
  }

  public async onSubmit(): Promise<void> {
    if (!this.contractorProposalFormGroup.valid) {
      return;
    }

    if (this.resp500.isOpen) this.resp500.close();
    if (this.missingProjectDetailsBanner.isOpen) this.missingProjectDetailsBanner.close();

    this.submitting = true;
    const value = JSON.parse(JSON.stringify(this.contractorProposalFormGroup.value));
    value.price = parseFloat(value.price);
    value.projectId = this.activatedRoute.snapshot.params.projectId;
    const resp = await this.apiRequestService.post('/api/proposal-accept', value);

    switch (resp.status) {
      case 200:
      case 201:
        this.analytics.pageAction(this.analytics.eventAction.user.contractor.proposal.accepted);
        this.contractorProposalFormGroup.reset();
        this.materialize.updateTextFields();
        this.messageService.setSelectedConversation(this.customer._id);
        this.router.navigateByUrl('/messages');
        break;
      case 404:
      default:
        this.resp500.open();
    }

    this.submitting = false;
  }

}
