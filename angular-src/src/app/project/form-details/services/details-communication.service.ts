import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Details} from '../../../models/project/details/details';

@Injectable({
  providedIn: 'root'
})
export class DetailsCommunicationService {
  private formEventSource: Subject<{details: Details, valid: boolean, forceNavigate: boolean}>;
  public formEvent$: Observable<{details: Details, valid: boolean, forceNavigate: boolean}>;

  private switchToMobileSource: Subject<void>;
  public switchToMobileEvent$: Observable<void>;

  private progressSource: Subject<number>;
  public progress$: Observable<number>;

  constructor() {
    this.formEventSource = new Subject<{details: Details, valid: boolean, forceNavigate: boolean}>();
    this.formEvent$ = this.formEventSource.asObservable();

    this.switchToMobileSource = new Subject<void>();
    this.switchToMobileEvent$ = this.switchToMobileSource.asObservable();

    this.progressSource = new Subject<number>();
    this.progress$ = this.progressSource.asObservable();
  }

  public formEvent(details: Details, valid: boolean, forceNavigate?: boolean) {
    this.formEventSource.next({details: details, valid: valid, forceNavigate: forceNavigate});
  }

  public switchToMobile() {
    this.switchToMobileSource.next();
  }

  public setProgress(details: Details) {
    this.progressSource.next(details.getProgress());
  }
}
