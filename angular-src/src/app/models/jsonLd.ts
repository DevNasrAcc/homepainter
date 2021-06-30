export type URL = string;

/**
 * Interface for a Postal Address
 * # See-Also https://schema.org/PostalAddress
 */
export interface IPostalAddress {
  '@type': 'PostalAddress';

  /**
   * The country. For example, USA. You can also provide the two-letter country code
   */
  addressCountry?: string;
  /**
   * The locality in which the street address is, and which is in the region. For example, Ames.
   */
  addressLocality?: string;
  /**
   * The region in which the locality is, and which is in the country. For example, Iowa or IA
   */
  addressRegion?: string;
  /**
   * The postal code. For example, 50010.
   */
  postalCode?: string;
  /**
   * 	The street address. For example, 2710 South Loop Dr
   */
  streetAddress?: string;
}

/**
 * Interface for a person
 * # See-Also https://schema.org/Person
 */
export interface IPerson {
  '@type': 'Person';
  /**
   * Family name. In the U.S., the last name of a Person.
   */
  familyName?: string;
  /**
   * Given name. In the U.S., the first name of a Person.
   */
  givenName?: string;
  /**
   * The job title of the person (for example, Financial Manager).
   */
  jobTitle?: string;
  /**
   * The name of the item.
   */
  name?: string;
}

export interface IAggregateRating {
  '@type': 'AggregateRating';

  /**
   * The highest value allowed in this rating system. If bestRating is omitted, 5 is assumed.
   */
  bestRating?: number | string;
  /**
   * The count of total number of ratings.
   */
  ratingCount?: number;
  /**
   * The count of total number of reviews.
   */
  reviewCount?: number;
  /**
   * The rating for the content.
   */
  ratingValue?: number | string;
  /**
   * The lowest value allowed in this rating system. If worstRating is omitted, 1 is assumed.
   */
  worstRating?: number | string;
}

export interface IRating {
  '@type': 'Rating';

  /**
   * The rating for the content.
   */
  ratingValue?: number | string;
}

export interface IReview {
  '@type': 'Review';

  /**
   * The author of this content or rating.
   * Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag.
   * That is equivalent to this and may be used interchangeably.
   */
  author?: IPerson;
  /**
   * Date of first broadcast/publication.
   */
  datePublished?: Date;
  /**
   * 	A description of the item.
   */
  description?: string;
  /**
   * The actual body of the review.
   */
  reviewBody?: string;
  /**
   * The rating given in this review. Note that reviews can themselves be rated.
   * The reviewRating applies to rating given by the review.
   * The aggregateRating property applies to the review itself, as a creative work.
   */
  reviewRating?: IRating;
}

/**
 * Interface for a HousePainter
 * # See-Also https://schema.org/HousePainter
 */
export interface IHousePainter {
  '@type': 'HousePainter';
  '@context': 'http://schema.org';

  /**
   * Unique identifier url that will not change
   */
  '@id'?: URL;
  /**
   * Physical address of the item.
   */
  address?: IPostalAddress;
  /**
   * The overall rating, based on a collection of reviews or ratings, of the item.
   */
  aggregateRating?: IAggregateRating;
  /**
   * A person who founded this organization
   */
  founder?: IPerson | Array<IPerson>;
  /**
   * The date that this organization was founded.
   */
  foundingDate?: Date | string;
  /**
   * An image of the item.
   */
  image?: URL | Array<URL>;
  /**
   * An associated logo
   */
  logo?: URL;
  /**
   * The name of the item.
   */
  name?: string;
  /**
   * A review of the item.
   */
  review?: Array<IReview>;
  /**
   * URL of a reference Web page that unambiguously indicates the item's identity.
   * E.g. the URL of the item's Wikipedia page, Wikidata entry, or official website.
   */
  sameAs?: Array<URL>;
  /**
   * URL of the item.
   */
  url?: URL;
}

/**
 * Interface for a HousePainter
 * # See-Also https://schema.org/HousePainter
 */
export interface IHousePainter {
  '@type': 'HousePainter';
  '@context': 'http://schema.org';

  /**
   * Unique identifier url that will not change
   */
  '@id'?: URL;
  /**
   * Physical address of the item.
   */
  address?: IPostalAddress;
  /**
   * The overall rating, based on a collection of reviews or ratings, of the item.
   */
  aggregateRating?: IAggregateRating;
  /**
   * A description of the item.
   */
  description: string;
  /**
   * A person who founded this organization
   */
  founder?: IPerson | Array<IPerson>;
  /**
   * The date that this organization was founded.
   */
  foundingDate?: Date | string;
  /**
   * An image of the item.
   */
  image?: URL | Array<URL>;
  /**
   * An associated logo
   */
  logo?: URL;
  /**
   * The name of the item.
   */
  name?: string;
  /**
   * A review of the item.
   */
  review?: Array<IReview>;
  /**
   * URL of a reference Web page that unambiguously indicates the item's identity.
   * E.g. the URL of the item's Wikipedia page, Wikidata entry, or official website.
   */
  sameAs?: Array<URL>;
  /**
   * URL of the item.
   */
  url?: URL;
}
