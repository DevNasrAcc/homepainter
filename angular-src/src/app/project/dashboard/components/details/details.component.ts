import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {Details} from "../../../../models/project/details/details";
import {isPlatformBrowser} from "@angular/common";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ICollapsible} from "angular2-materialize-v1/lib/IInstance";
import {QueryParameterLoaderService} from "../../services/query-parameter-loader.service";
import {Project} from "../../../../models/project/project";

declare var google: any;

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.less']
})
export class DetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean>;

  public isHowItWorksOpen: boolean;
  public project: Project;
  public details: Details;
  public projectProgress: number;
  public mapVisible: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private materialize: Angular2MaterializeV1Service,
              private localStorageService: LocalStorageService, private queryParameterLoaderService: QueryParameterLoaderService) {
    this.ngUnsubscribe = new Subject<boolean>();
    this.isHowItWorksOpen = localStorageService.getHowItWorksIsOpen();
    if (this.isHowItWorksOpen === undefined) {
      this.isHowItWorksOpen = true;
      this.localStorageService.setHowItWorksIsOpen(this.isHowItWorksOpen);
    }
    this.project = localStorageService.getActiveProject();
    this.details = this.project.details;
    this.details = localStorageService.getProjectDetails();
    this.projectProgress = this.details.getProgress();
    this.mapVisible = isPlatformBrowser(this.platformId);

    this.localStorageService.activeProjectUpdatedEvent$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(project => {
        this.details = project.details;
        this.projectProgress = this.details.getProgress();
      });
  }

  async ngOnInit(): Promise<void> {
    await this.queryParameterLoaderService.load();
  }

  ngAfterViewInit() {
    const instance = <ICollapsible>this.materialize.initCollapsible('#howItWorks', {
      onOpenEnd: () => this.onResize()
    });
    if (instance && this.isHowItWorksOpen) instance.open(0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('window:resize', ['$event'])
  private onResize() {
    for (let i = 1; i < 5; ++i) {
      const elms: NodeListOf<HTMLElement> = document.querySelectorAll(`.step-${i}-same-height`);
      elms[0].style.height = `${elms[1].offsetHeight}px`;
    }
  }

  public openCloseHowItWorks() {
    this.isHowItWorksOpen = !this.isHowItWorksOpen;
    this.localStorageService.setHowItWorksIsOpen(this.isHowItWorksOpen);
  }

  // @ts-ignore
  public onMapLoad(mapInstance: google.maps.Map) {
    new google.maps.KmlLayer({
      url: `https://us-east-1.linodeobjects.com/homepainter-kml-storage/zip${this.details.address.zipCode}.kml`,
      suppressInfoWindows: true,
      map: mapInstance
    });
  }
}
