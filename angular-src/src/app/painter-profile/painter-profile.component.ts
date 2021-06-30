import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Contractor} from '../models/user/contractor';
import {SeoService} from '../services/seo.service';
import {IHousePainter} from '../models/jsonLd';
import {Angular2MaterializeV1Service} from "angular2-materialize-v1";
import {ITooltip} from "angular2-materialize-v1/lib/IInstance";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "../services/local-storage.service";
import {Project} from "../models/project/project";
import {Proposal} from "../models/project/proposal/proposal";
import {ApiRequestService} from "../services/api-request.service";

interface IReview {
  reviewer: string;
  contractorOverallRating: number;
  contractorProfessionalismRating: number;
  contractorQualityRating: number;
  contractorAdditionalComment: string;
  createdAt: string;
}

@Component({
  selector: 'app-painter-profile',
  templateUrl: './painter-profile.component.html',
  styleUrls: ['./painter-profile.component.less']
})
export class PainterProfileComponent implements OnInit, AfterViewInit {

  @ViewChild('copyLinkText') private copyLinkText: ElementRef;

  public defaultImage = 'https://us-east-1.linodeobjects.com/homepainter-images/default-profile-image.png';
  public contractor: Contractor;
  public showExtraReviews: boolean;
  public reviews: Array<IReview>;
  public reviewAverage: number;
  public year: number;
  public project: Project;
  public requestingQuote: boolean;
  public requestedQuote: boolean;

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService,
              private materialize: Angular2MaterializeV1Service, private router: Router,
              private localStorageService: LocalStorageService, private apiRequestService: ApiRequestService) {
    const data = this.seoService.getDataFromActivatedRoute();
    this.contractor = new Contractor(data.contractor);
    this.project = this.localStorageService.getActiveProject();
    this.showExtraReviews = false;
    this.reviews = data.contractor.reviews || [];
    this.year = new Date().getFullYear();
    this.requestingQuote = false;

    this.requestedQuote = this.project.invitedContractors.includes(this.contractor._id);
  }

  ngOnInit(): void {
    let min;
    let max;
    this.reviewAverage = 0;
    for (const review of this.reviews || []) {
      if (!min || review.contractorOverallRating < min) {
        min = review.contractorOverallRating;
      }
      if (!max || review.contractorOverallRating > max) {
        max = review.contractorOverallRating;
      }
      this.reviewAverage += review.contractorOverallRating;
    }
    this.reviewAverage = this.reviews.length > 0
      ? (this.reviewAverage / this.reviews.length)
      : 0;

    // create / update fields for title & description
    const data = {
      title: `${this.contractor.organizationName} - Get An Online Quote`,
      description: `${this.contractor.bio} - ${this.reviewAverage.toFixed(1)} stars - ${this.reviews.length} reviews`,
      'og:url': `https://thehomepainter.com/u/${this.contractor._id}`,
      'og:image': this.contractor.picture || this.defaultImage,
      'og:image:alt': `${this.contractor.organizationName} profile picture`,
    }
    this.seoService.updateTitle(data.title);
    this.seoService.updateMetaTags(data);

    // create structured data
    // @ts-ignore

    const housePainter: IHousePainter = {
      '@context': 'http://schema.org',
      '@id': `https://thehomepainter.com/u/${this.contractor._id}`,
      '@type': 'HousePainter',
      founder: {
        '@type': 'Person',
        familyName: this.contractor.lastName,
        givenName: this.contractor.firstName,
        name: `${this.contractor.firstName} ${this.contractor.lastName}`,
      },
      image: this.contractor.picture || this.defaultImage,
      logo: this.contractor.picture || this.defaultImage,
      name: this.contractor.organizationName,
      sameAs: [],
      url: `https://thehomepainter.com/u/${this.contractor._id}`
    };

    if (this.reviews.length > 0) {
      housePainter.aggregateRating = {
        '@type': 'AggregateRating',
          bestRating: max,
          ratingCount: this.reviews.length,
          ratingValue: this.reviewAverage,
          worstRating: min,
      };
      // @ts-ignore
      housePainter.review = this.reviews.map(r => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.reviewer
        },
        datePublished: r.createdAt,
        description: r.contractorAdditionalComment,
        reviewBody: r.contractorAdditionalComment,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.contractorOverallRating
        }
      }));
    }

    if (this.contractor.bio) {
      housePainter.description = this.contractor.bio;
    }

    if (this.contractor.address.isValid()) {
      housePainter.address = {
        '@type': 'PostalAddress',
          addressCountry: 'US',
          streetAddress: this.contractor.address.streetAddress,
          addressLocality: this.contractor.address.city,
          addressRegion: this.contractor.address.state,
          postalCode: this.contractor.address.zipCode ? this.contractor.address.zipCode.toString(): '',
      };
    }

    const socialMediaValues = Object.values(this.contractor.socialMedia);
    for (const value of socialMediaValues) {
      if (!!value) {
        housePainter.sameAs.push(value);
      }
    }
    const warranty = this.contractor.warranty;
    const tags = this.contractor.tags;
    console.log("contractor",this.contractor)
    this.seoService.updateJsonLd(housePainter);
  }

  ngAfterViewInit() {
    this.materialize.initModal('#request-quote-modal', { endingTop: '20%' });
    this.materialize.initModal('#share', { endingTop: '20%' });
  }

  public selectCopyLinkText(): void {
    this.copyLinkText.nativeElement.select();
    this.copyLinkText.nativeElement.setSelectionRange(0, 99999); /* For mobile devices */
  }

  public copyLink(): void {
    this.selectCopyLinkText();
    document.execCommand('copy');
    document.getSelection().removeAllRanges();
    const tooltip = <ITooltip>this.materialize.initTooltip('#copyButton');
    tooltip.open();
    window.setTimeout(() => { tooltip.close(); tooltip.destroy(); }, 1500);
  }

  public getWidthForReviews(value: number): number {
    return (this.reviews.filter(r => r.contractorOverallRating === value).length / this.reviews.length) * 100;
  }

  public continueWithContractor() {
    this.localStorageService.saveSelectedContractorId(this.contractor._id);
    this.router.navigateByUrl('/details');
  }

  public async requestQuote() {
    if (this.requestedQuote || this.project.status === 'creating') {
      return;
    }
    this.requestingQuote = true;

    const resp = await this.apiRequestService.post('/api/invite-painter', {
      contractorId: this.contractor._id,
      projectId: this.project._id,
      message: 'Hi, I would like to invite you to quote my project.'
    });

    switch (resp.status) {
      case 200:
        this.localStorageService.saveActiveProject(resp.body);
        break;
      case 404:
        await (() => new Promise(resolve => setTimeout(resolve, 2000)))();
        if (!environment.angularServe) { break; }
        this.project.invitedContractors.push(this.contractor._id);
        this.project.proposals.push(new Proposal({
          contractor: this.contractor,
          price: 2000,
          message: 'Hello! My name is Jacob and I have been painting residential homes for 5 years. I\'d love to ' +
            'help on your interior project and will be available to start the week of August 24th and should be able ' +
            'to complete the project in 1 to 1.5 days. Thank you and I look forward to helping with your paint project!',
          earliestStartDate: 'Aug 21, 2020'
        }));
        this.localStorageService.saveActiveProject(this.project);
      default:
        this.materialize.toast({html: 'There was an error inviting ' + this.contractor.organizationName});
    }

    this.requestingQuote = false;
    this.requestedQuote = true;
  }
}
