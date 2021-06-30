import {AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {AnalyticsService} from '../../services/analytics.service';
import {Angular2MaterializeV1Service} from 'angular2-materialize-v1';
import {LocalStorageService} from '../../services/local-storage.service';
import {LocationService} from '../../project/form-details/services/location.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ITooltip} from 'angular2-materialize-v1/lib/IInstance';
import {HttpClient} from '@angular/common/http';
import {Post} from '../../models/ghost/post';
import {isPlatformBrowser} from '@angular/common';
import {Contractor} from '../../models/user/contractor';
import {Address} from '../../models/user/base/address';
import {ResponsiveService} from '../../services/responsive.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private tooltips: Array<ITooltip>;

  public readonly duplicatedHeaderText: string = 'Explore painters and get quotes for your home project';
  public getStartedFormGroup: FormGroup;
  public projectExamples: Array<any>;
  public contractorExamples: Array<Contractor>;
  public faqItems: Array<any>;
  public blogPosts: Array<Post>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private formBuilder: FormBuilder,
              public localStorageService: LocalStorageService, private analytics: AnalyticsService, private http: HttpClient,
              private locationService: LocationService, private materialize: Angular2MaterializeV1Service,
              public responsiveService: ResponsiveService) {
    this.getStartedFormGroup = formBuilder.group({
      zipCode: [undefined],
      projectType: ['', [Validators.required, Validators.pattern(/(interior|exterior|deck)/)]],
    });
    this.projectExamples = [
      {
        img: 'https://us-east-1.linodeobjects.com/homepainter-images/2ac793dd-1554-42dd-9404-824a75dce830.jpg',
        name: 'Aaron',
        location: 'Ames, Iowa',
        speed: '2 quotes - 9 minutes'
      },
      {
        img: 'https://us-east-1.linodeobjects.com/homepainter-images/6ded1a5d-5870-4117-944a-bf159904de71.jpg',
        name: 'Kristina',
        location: 'Norwalk, Iowa',
        speed: '3 quotes - 21 minutes'
      },
      {
        img: 'https://us-east-1.linodeobjects.com/homepainter-images/534d78ca-b704-4ea5-9a36-fa45eeb3fa1f.jpg',
        name: 'Annette',
        location: 'Norwalk, Iowa',
        speed: '3 quotes - 1 hour'
      },
      {
        img: 'https://us-east-1.linodeobjects.com/homepainter-images/153ca199-dd0a-4d63-bad8-ad785b39b3df.jpg',
        name: 'Steve',
        location: 'Norwalk, Iowa',
        speed: '2 quotes - 1 hour'
      },
      {
        img: 'https://us-east-1.linodeobjects.com/homepainter-images/533cbedd-5ac4-4f08-981c-8cf2e603cf48.jpg',
        name: 'Brooke',
        location: 'Adel, Iowa',
        speed: '2 quotes - 1.3 hours'
      },
      {
        img: 'https://us-east-1.linodeobjects.com/homepainter-images/0eb3192c-ecae-4b3b-adf1-68f18a162248.jpg',
        name: 'Gina',
        location: 'Norwalk, Iowa',
        speed: '3 quotes - 6 hours'
      },
    ];
    this.contractorExamples = [
      new Contractor({
        _id: '5e5ee69f7761c60e72827147',
        picture: 'https://us-east-1.linodeobjects.com/homepainter-images/592e7250-0676-4b8b-95be-bc2bdd24ac04.jpg',
        organizationName: 'Alpha Painting Corp',
        address: new Address({
          city: 'Urbandale',
          state: 'Iowa',
        }),
        rating: 5,
        ratingCount: 4,
        completedJobCount: 5,
      }),
      new Contractor({
        _id: '5e5056fc9010317f14c0fa2d',
        picture: 'https://us-east-1.linodeobjects.com/homepainter-images/175492f9-6e26-4c3a-ae54-86d9b9d4fae3.jpeg',
        organizationName: 'Painters Promise',
        address: new Address({
          city: 'Ames',
          state: 'Iowa',
        }),
        rating: 5,
        ratingCount: 3,
        completedJobCount: 5,
      }),
      new Contractor({
        _id: '5e5ff248e2029f217b6fc3d1',
        picture: 'https://us-east-1.linodeobjects.com/homepainter-images/aee69742-2726-498f-b71e-1183f96e9463.jpg',
        organizationName: 'Kunzman Painting',
        address: new Address({
          city: 'Ankeny',
          state: 'Iowa',
        }),
        rating: 5,
        ratingCount: 1,
        completedJobCount: 1,
      }),
      new Contractor({
        _id: '5ea257956397dd298c68f030',
        picture: 'https://us-east-1.linodeobjects.com/homepainter-images/48a15a0f-d0f1-43ea-bc57-6e1a0ee24514.jpg',
        organizationName: '515 Interior Painting',
        address: new Address({
          city: 'Polk City',
          state: 'Iowa',
        }),
        rating: 5,
        ratingCount: 1,
        completedJobCount: 1,
      }),
      new Contractor({
        _id: '5f458707eb03ae9f2767de57',
        picture: 'https://us-east-1.linodeobjects.com/homepainter-images/b6380a00-4ec6-4738-8c5d-f49c001f7505.jpg',
        organizationName: 'Sure Can, LLC',
        address: new Address({
          city: 'Ames',
          state: 'Iowa',
        }),
        rating: 0,
        ratingCount: 0,
        completedJobCount: 0,
      }),
      new Contractor({
        _id: '5ec579d63a17c061323243fc',
        picture: 'https://us-east-1.linodeobjects.com/homepainter-images/890bd763-732e-4f77-a158-c63d6819025b.jpg',
        organizationName: 'Artisans of Faith Painting',
        address: new Address({
          city: 'West Des Moines',
          state: 'Iowa',
        }),
        rating: 0,
        ratingCount: 0,
        completedJobCount: 0,
      }),
    ];
    this.faqItems = [
      {
        q: 'What precautions do the painters take in regards to COVID-19?',
        a: 'Homepainter is a fantastic way to get contactless quotes and schedule your project during COVID-19. ' +
          'Our painters are expected to adapt to the comfort level of our customers. You can talk with your painter ' +
          'to set expectations prior to booking on masks, distancing, and the number of employees on site.',
        open: false
      },
      {
        q: 'How does homepainter vet their painters?',
        a: 'All of our painters undergo a criminal background check and quality assessment to ensure our ' +
          'homeowner\'s safety and job satisfaction. We collect and store the proper license and insurance ' +
          'documentation for you.',
        open: false
      },
      {
        q: 'What personal information is required to book a project?',
        a: 'Customer name, contact info including phone and email, project information, and payment details (secured by Stripe)',
        open: false
      },
      {
        q: 'What insurance/coverage do the painters have?',
        a: 'We collect and store up-to-date insurance information on all contractors including general liability and workers\' compensation coverage.',
        open: false
      },
      {
        q: 'Do I have to create an account to book my project?',
        a: 'No, creating an account is not necessary to book a project with homepainter. If you choose to check out as a guest, you will receive email links to return to your project to message painters and view information.',
        open: false
      }
    ];
    this.blogPosts = [];
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    this.materialize.initSelect('select', {
      classes: 'select-override',
      dropdownOptions: { coverTrigger: false }
    });
    this.materialize.initCollapsible('.collapsible.expandable', {
      accordion: false,
      onOpenStart: (e: HTMLLIElement) => this.changeIcon(e),
      onCloseStart: (e: HTMLLIElement) => this.changeIcon(e)
    });

    const blogPosts = await this.http.get<any>('https://thehomepainter.com/blog/ghost/api/v3/content/posts/?key=6c32fb8ab01fcc0577ac7659cd&limit=3&filter=tag:featured&include=authors,tags').toPromise();
    for (const post of blogPosts.posts) {
      this.blogPosts.push(new Post(post));
    }

    // let the content render so tooltips will appear
    if (isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => {
        this.tooltips = (this.materialize.initTooltip('.tooltipped') as ITooltip[]);
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    for (const tooltip of this.tooltips || []) {
      tooltip.destroy();
    }
  }

  private changeIcon(e: HTMLLIElement): void {
    const index = parseInt(e.id.substr(2), 10);
    this.faqItems[index].open = !this.faqItems[index].open;
  }

  public onGetStartedSubmit() {
    this.getStartedFormGroup.markAllAsTouched();
    const value = this.getStartedFormGroup.value;

    if(!value.zipCode || value.zipCode.toString().length !== 5){
      document.getElementById("zip-code-desktop-label").style.color = "red";
      document.getElementById("zip-code-desktop").style.setProperty('border-left', '1px solid red', 'important');
      document.getElementById("zip-code-mobile").style.setProperty('border-left', '1px solid red', 'important');
      return;
    }
    else{
      document.getElementById("zip-code-desktop-label").style.color = "black";
      document.getElementById("zip-code-desktop").style.setProperty('border', 'none', 'important');
      document.getElementById("zip-code-mobile").style.setProperty('border', 'none', 'important');
    }

    if (this.getStartedFormGroup.invalid) {
      return;
    }

    this.localStorageService.setIsEditingUnfinishedProject(true);
    this.localStorageService.resetUnfinishedProject();
    this.localStorageService.resetActiveProject();

    const details = this.localStorageService.getProjectDetails();
    details.address.zipCode = value.zipCode;
    details.decorType = value.projectType;

    this.localStorageService.saveProjectDetails(details);
    this.router.navigateByUrl('/project/explore-painters');
  }
}
