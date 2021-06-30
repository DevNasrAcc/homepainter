import {Inject, Injectable, OnDestroy, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Details} from '../models/project/details/details';
import {environment} from '../../environments/environment';
import {Customer} from '../models/user/customer';
import {Contractor} from '../models/user/contractor';
import {Observable, Subject} from 'rxjs';
import {Project} from '../models/project/project';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements OnDestroy {

  private customerUpdatedSource: Subject<Customer>;
  private contractorUpdatedSource: Subject<Contractor>;
  private activeProjectUpdatedSource: Subject<Project>;
  public customerUpdatedEvent$: Observable<Customer>;
  public contractorUpdatedEvent$: Observable<Contractor>;
  public activeProjectUpdatedEvent$: Observable<Project>;

  // We need a reference to the type, function and options to remove the event listener later
  private storageEventListener: {type: 'storage', func: EventListenerOrEventListenerObject, options: any};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.customerUpdatedSource = new Subject<Customer>();
    this.contractorUpdatedSource = new Subject<Contractor>();
    this.activeProjectUpdatedSource = new Subject<Project>();
    this.customerUpdatedEvent$ = this.customerUpdatedSource.asObservable();
    this.contractorUpdatedEvent$ = this.contractorUpdatedSource.asObservable();
    this.activeProjectUpdatedEvent$ = this.activeProjectUpdatedSource.asObservable();

    if (this.hasStorageCapability()) {
      this.storageEventListener = {type: 'storage', func: (e: StorageEvent) => {this.onStorageEvent(e); }, options: false};
      window.addEventListener(this.storageEventListener.type, this.storageEventListener.func, this.storageEventListener.options);
    }
  }

  ngOnDestroy(): void {
    if (this.hasStorageCapability()) {
      // remove references
      window.removeEventListener(this.storageEventListener.type, this.storageEventListener.func, this.storageEventListener.options);
    }
  }

  private onStorageEvent(evt: StorageEvent): void {
    const eventValue = evt.newValue !== undefined && evt.newValue !== null && (evt.newValue.startsWith('{') || evt.newValue.startsWith('['))
      ? JSON.parse(this.unescape(evt.newValue))
      : {};

    switch (evt.key) {
      case environment.localStorageNames.customer:
        this.customerUpdatedSource.next(new Customer(eventValue));
        break;
      case environment.localStorageNames.contractor:
        this.contractorUpdatedSource.next(new Contractor(eventValue));
        break;
      case environment.localStorageNames.activeProject:
        this.activeProjectUpdatedSource.next(new Project(eventValue));
        break;
    }
  }

  private hasStorageCapability(): boolean {
    return typeof(localStorage) !== 'undefined' && isPlatformBrowser(this.platformId);
  }

  private escape(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;');
  }

  private unescape(value) {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x2F;/g, '/')
      .replace(/&#x5C;/g, '\\')
      .replace(/&#96;/g, '`');
  }

  private get(localStorageName): any {
    if (this.hasStorageCapability()) {
      let value = localStorage.getItem(localStorageName);
      // unescape and re-escape to not get weird text with the &'s
      if (value !== undefined && value !== null) {
        value = this.unescape(value);
        return JSON.parse(value);
      }
      else {
        return {};
      }
    }
    else {
      return {};
    }
  }

  private save(localStorageName, value): void {
    if (this.hasStorageCapability()) {
      value = JSON.stringify(value);
      value = this.escape(value);
      localStorage.setItem(localStorageName, value);

      // https://stackoverflow.com/questions/26974084/listen-for-changes-with-localstorage-on-the-same-window
      // Storage events only fire for other web pages.
      // To get storage events to fire on our spa, we will fire it manually
      const storageEvent = new StorageEvent('storage', {key: localStorageName, newValue: value});
      this.onStorageEvent(storageEvent);
    }
  }

  private remove(localStorageName): void {
    if (this.hasStorageCapability()) {
      localStorage.removeItem(localStorageName);

      // https://stackoverflow.com/questions/26974084/listen-for-changes-with-localstorage-on-the-same-window
      // Storage events only fire for other web pages.
      // To get storage events to fire on our spa, we will fire it manually
      const storageEvent = new StorageEvent('storage', {key: localStorageName, newValue: '{}'});
      this.onStorageEvent(storageEvent);
    }
  }

  /**
   * We have created local storage names that are now deprecated. We need to remove these.
   */
  public removeDeprecatedUsages(): void {
    this.remove('PaintEstimate');
    this.remove('product');
    this.remove('user');
    this.remove('agentUnfinishedCustomer');
    this.remove('isAgentEditingUnfinishedCustomer');
    this.remove('homeowner');
    this.remove('agent');
    this.remove('proposalAcceptAuth');
    this.remove('scheduleAuth');
  }

  public reset(): void {
    this.resetCustomer();
    this.resetContractor();
    this.resetIsEditingUnfinishedProject();
    this.resetActiveProject();
    this.resetUnfinishedProject();
    this.clearSelectedContractorId();
  }

  public getCustomer(): Customer {
    return new Customer(this.get(environment.localStorageNames.customer));
  }

  public saveCustomer(customer: Customer): void {
    this.save(environment.localStorageNames.customer, customer);
  }

  public resetCustomer(): void {
    this.save(environment.localStorageNames.customer, new Customer());
  }

  public getContractor(): Contractor {
    return new Contractor(this.get(environment.localStorageNames.contractor));
  }

  public saveContractor(contractor: Contractor): void {
    this.save(environment.localStorageNames.contractor, contractor);
  }

  public resetContractor(): void {
    this.save(environment.localStorageNames.contractor, new Contractor());
  }

  public getActiveProject(): Project {
    return new Project(this.get(environment.localStorageNames.activeProject));
  }

  public saveActiveProject(project: Project): void {
    this.save(environment.localStorageNames.activeProject, project);

    if (this.getIsEditingUnfinishedProject()) {
      this.saveUnfinishedProject(project);
    }
  }

  public resetActiveProject(): void {
    this.save(environment.localStorageNames.activeProject, new Project());
  }

  public getUnfinishedProject(): Project {
    return new Project(this.get(environment.localStorageNames.unfinishedProject));
  }

  public saveUnfinishedProject(project: Project): void {
    this.save(environment.localStorageNames.unfinishedProject, project);
  }

  public resetUnfinishedProject(): void {
    this.save(environment.localStorageNames.unfinishedProject, new Project());
  }

  public getIsEditingUnfinishedProject(): boolean {
    return this.get(environment.localStorageNames.isEditingUnfinishedProject);
  }

  public setIsEditingUnfinishedProject(isEditingUnfinishedProject: boolean): void {
    this.save(environment.localStorageNames.isEditingUnfinishedProject, isEditingUnfinishedProject);
  }

  public resetIsEditingUnfinishedProject(): void {
    this.save(environment.localStorageNames.isEditingUnfinishedProject, false);
  }

  public getProjectDetails(): Details {
    return this.getActiveProject().details;
  }

  public saveProjectDetails(details: Details) {
    const project = this.getActiveProject();
    project.details = details;
    this.saveActiveProject(project);
  }

  public getSelectedContractorId(): string {
    return this.get(environment.localStorageNames.selectedContractorId);
  }

  public saveSelectedContractorId(id: string): void {
    this.save(environment.localStorageNames.selectedContractorId, id);
  }

  public clearSelectedContractorId() {
    this.remove(environment.localStorageNames.selectedContractorId);
  }

  public getHowItWorksIsOpen(): boolean {
    return this.get(environment.localStorageNames.howItWorksIsOpen).open;
  }

  public setHowItWorksIsOpen(open: boolean): void {
    this.save(environment.localStorageNames.howItWorksIsOpen, {open});
  }
}
