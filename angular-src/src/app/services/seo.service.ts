import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {environment} from '../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {Observable, Subject} from 'rxjs';
import {IHousePainter} from '../models/jsonLd';

export interface IMetaTags {
  title: string;
  description: string;
  'og:url'?: string;
  'og:title'?: string;
  'og:description'?: string;
  'og:image'?: string;
  'og:image:alt'?: string;
  'twitter:title'?: string;
  'twitter:description'?: string;
  'twitter:image'?: string;
  'twitter:image:alt'?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private DESCRIPTION = 'Save time, money, and hassle by getting quotes and hiring pre-qualified painters online. Explore painters, create your project, and hire online.';
  private jsonLdSource: Subject<IHousePainter>;
  public jsonLdEvent$: Observable<IHousePainter>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private meta: Meta, private titleService: Title,
              private activatedRoute: ActivatedRoute) {
    this.jsonLdSource = new Subject<IHousePainter>();
    this.jsonLdEvent$ = this.jsonLdSource.asObservable();
  }

  /**
   * This function is needed because lazy loading and child views are nested in the route.
   * So we have to loop to get the data.
   */
  public getDataFromActivatedRoute(): any {
    let data = null;
    let route = this.activatedRoute.root;

    while (route) {
      data = route.data || data;
      route = route.firstChild;
    }

    return data._value;
  }

  public updateAll(data?: any): void {
    if (!data) {
      data = this.getDataFromActivatedRoute() || {};
    }
    this.updateTitle(data.title);
    this.updateMetaTags(data);
    this.updateJsonLd();
  }

  public updateTitle(title?: string) {
    this.titleService.setTitle(title || environment.appTitle);
  }

  public updateMetaTags(data: IMetaTags): void {
    const title = 'Need a painter? Get a free online quote and start your home improvement project today!';
    const webUrl = isPlatformBrowser(this.platformId) ? window.location.href : 'https://thehomepainter.com/';
    const imgUrl = webUrl + 'assets/images/open-graph-image.jpg';
    const imgAlt = 'picture of a home with words';

    const tags = [
      {name: 'robots', content: 'follow'},
      {
        name: 'keywords',
        content: 'painting,painter,house painting,painting company,painting contractor,painting service,housepainter,residential painting,commercial painter,commercial painting contractor,residential painting contractor,des moines area,iowa,desmoines,exterior home painting,kitchen painting,cabinet refinishing,historic home painting,peterson painting,cary peterson,best painter,top painting contractors,top quality painting contractor,staining,wood siding painting,stucco painting,brick painting'
      },
      {name: 'author', content: 'homepainter, inc'},
      {name: 'description', content: data.description || this.DESCRIPTION},

      // OG Properties
      {property: 'og:url', content: data['og:url'] || webUrl},
      {property: 'og:type', content: 'website'},
      {property: 'og:locale', content: 'en_US'},
      {property: 'og:site_name', content: environment.appTitle},
      {property: 'og:title', content: data['og:title'] || data.title || title},
      {property: 'og:description', content: data['og:description'] || data.description || this.DESCRIPTION},
      {property: 'og:image', content: data['og:image'] || imgUrl},
      {property: 'og:image:alt', content: data['og:image:alt'] || imgAlt},

      // Facebook
      {property: 'fb:app_id', content: '232394170984216'},

      // Twitter
      {property: 'twitter:card', content: 'summary'},
      {property: 'twitter:site', content: '@the_homepainter'},
      {property: 'twitter:title', content: data['twitter:title'] || data['og:title'] || data.title || title},
      {property: 'twitter:description', content: data['twitter:description'] || data['og:description'] || data.description || this.DESCRIPTION},
      {property: 'twitter:image', content: data['twitter:image'] || data['og:image'] || imgUrl},
      {property: 'twitter:image:alt', content: data['twitter:image:alt'] || data['og:image:alt'] || imgAlt},
    ];

    tags.forEach(tag => this.meta.updateTag(tag));
  }

  public updateJsonLd(housePainter?: IHousePainter) {
    if (!housePainter) {
      housePainter = {
        '@context': 'http://schema.org',
        '@type': 'HousePainter',
        image: ['https://thehomepainter.com/assets/images/logo.png', 'https://thehomepainter.com/assets/images/homeIconLarge.png'],
        '@id': 'https://thehomepainter.com/',
        name: 'homepainter',
        description: this.DESCRIPTION,
        founder: [
          {'@type': 'Person', jobTitle: 'CEO', givenName: 'Jacob', familyName: 'McClarnon'},
          {'@type': 'Person', jobTitle: 'CTO', givenName: 'Anthony', familyName: 'House'}
        ],
        foundingDate: '2018-04-01',
        address: {'@type': 'PostalAddress', streetAddress: '2710 South Loop Dr', addressLocality: 'Ames', addressRegion: 'IA', postalCode: '50010', addressCountry: 'US'},
        url: 'https://thehomepainter.com/',
        logo: 'https://thehomepainter.com/assets/images/homeIconLarge.png',
        sameAs: [
          'https://facebook.com/HomePainter-1252435358245828/',
          'https://instagram.com/homepainter_/',
          'https://pinterest.com/the_homepainter/',
          'https://twitter.com/the_homepainter'
        ],
      };
    }
    this.jsonLdSource.next(housePainter);
  }
}
