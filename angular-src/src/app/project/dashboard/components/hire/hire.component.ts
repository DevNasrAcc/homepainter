import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Subject} from "rxjs";
import {Customer} from "../../../../models/user/customer";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {takeUntil} from "rxjs/operators";
import {isPlatformBrowser} from "@angular/common";
import {Contractor} from "../../../../models/user/contractor";
import {ChargeDetails} from "../../../../models/charge-details";
import {ProjectService} from "../../../../models/user/project.service";
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Project} from "../../../../models/project/project";
import {ResponsiveService} from "../../../../services/responsive.service";

@Component({
  selector: 'app-hire',
  templateUrl: './hire.component.html',
  styleUrls: ['./hire.component.less']
})
export class HireComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;

  public customer: Customer;
  public project: Project;
  public selectedPainter: Contractor;
  public chargeDetails: ChargeDetails;
  public year: number;
  public discountFormGroup: FormGroup;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private localStorageService: LocalStorageService,
              private materialize: Angular2MaterializeV1Service, private projectService: ProjectService,
              private formBuilder: FormBuilder, public responsiveService: ResponsiveService) {
    this.ngUnsubscribe = new Subject<boolean>();
    this.customer = this.localStorageService.getCustomer();
    this.project = this.localStorageService.getActiveProject();
    this.selectedPainter = this.project.selectedProposal
      ? this.project.selectedProposal.contractor
      : new Contractor();
    this.chargeDetails = new ChargeDetails();
    this.year = new Date().getFullYear();
    this.discountFormGroup = this.formBuilder.group({
      discount: [this.project.promoCode, []]
    });

    this.localStorageService.customerUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(customer => {this.customer = customer});

    this.localStorageService.activeProjectUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(project => {
        this.project = project;
        this.selectedPainter = this.project.selectedProposal
          ? this.project.selectedProposal.contractor
          : new Contractor();
      });
  }

  async ngOnInit(): Promise<void> {
    if (this.customer.hasFilledOutContactInfo() && this.project.isValid()) {
      this.chargeDetails = await this.projectService.getChargeDetails(this.customer, this.project);
      await this.projectService.saveProgress(this.project, true); // saves the selected from previous step painter
    }
    else {
      this.chargeDetails = new ChargeDetails();
    }
  }

  ngAfterViewInit() {
    this.materialize.updateTextFields();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public async onSubmitDiscount() {
    if (this.discountFormGroup.disabled) return;

    this.discountFormGroup.disable();

    const oldDiscount = this.chargeDetails.discount;
    this.project.promoCode = this.discountFormGroup.value.discount;
    this.localStorageService.saveActiveProject(this.project);
    this.chargeDetails = await this.projectService.getChargeDetails(this.customer, this.project);

    if (this.chargeDetails.discount !== oldDiscount && this.chargeDetails.discount === 0)
      this.materialize.toast({html: 'Discount removed!', displayLength: 4000});
    else
      this.materialize.toast({html: 'Discount applied!', displayLength: 4000});

    this.discountFormGroup.enable();
  }

}
