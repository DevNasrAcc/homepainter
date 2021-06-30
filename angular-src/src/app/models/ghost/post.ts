import {Author} from "./author";
import {Tag} from "./tag";

export class Post {
  public title: string;
  public feature_image: string;
  public created_at: string;
  public updated_at: string;
  public published_at: string;
  public authors: Array<Author>;
  public tags: Array<Tag>;
  public primary_author: Author;
  public primary_tag: Tag;
  public url: string;
  public reading_time: number;

  constructor(obj?: any) {
    this.title = obj.title;
    this.feature_image = obj.feature_image;
    this.created_at = obj.created_at;
    this.updated_at = obj.updated_at;
    this.published_at = obj.published_at;
    this.authors = [];
    this.tags = [];
    this.primary_author = new Author(obj.primary_author);
    this.primary_tag = new Tag(obj.primary_tag);
    this.url = obj.url;
    this.reading_time = obj.reading_time;

    for (const author of obj.authors || []) {
      this.authors.push(new Author(author));
    }

    for (const tag of obj.tags || []) {
      this.tags.push(new Tag(tag));
    }
  }
}
