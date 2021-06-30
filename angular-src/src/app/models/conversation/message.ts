import {User} from "../user/base/user";

export class Message {
  private readonly imgAndLinkSplitter: RegExp;
  private readonly imgAndLinkCaptureGroups: RegExp;
  private readonly imgRegex: RegExp;
  private readonly linkRegex: RegExp;

  public _id: string;
  public from: string;
  public to: string;
  public fromReadAt: Date;
  public toReadAt: Date;
  public message: string;
  public markdown: Array<{type: 'img' | 'a' | 'p', text: string, link?: string}>;
  public createdAt: Date;
  public viewTime: boolean;

  constructor(obj?: any) {
    if (!obj) obj = {};

    this.imgAndLinkSplitter = /(!?\[[^\[]+]\([^)]+\))/g;
    this.imgAndLinkCaptureGroups = /\[([^\[]+)]\(([^)]+)\)/g;
    this.imgRegex = /(!\[[^\[]+]\([^)]+\))/g;
    this.linkRegex = /(\[[^\[]+]\([^)]+\))/g;

    this._id = obj._id || undefined;
    this.from = obj.from || '';
    this.to = obj.to || '';
    this.fromReadAt = obj.fromReadAt ? new Date(obj.fromReadAt) : undefined;
    this.toReadAt = obj.toReadAt ? new Date(obj.toReadAt) : undefined;
    this.message = obj.message || '';
    this.markdown = this.parseMarkdown(obj.message);
    this.createdAt = obj.createdAt ? new Date(obj.createdAt) : new Date();
    this.viewTime = obj.viewTime === true;
  }

  public parseMarkdown(string: string): Array<{type: 'img' | 'a' | 'p', text: string, link?: string}> {
    const splitText = string.split(this.imgAndLinkSplitter);

    const markdown = [];

    for (let text of splitText) {
      if (!text) {
        continue;
      }

      if (this.imgRegex.test(text)) {
        const groups = text.split(this.imgAndLinkCaptureGroups);
        markdown.push({ type: 'img', text: groups[1], link: groups[2] });
      }
      else if (this.linkRegex.test(text)) {
        const groups = text.split(this.imgAndLinkCaptureGroups);
        markdown.push({ type: 'a', text: groups[1], link: groups[2] });
      }
      else {
        markdown.push({ type: 'p', text: text });
      }
    }

    return markdown;
  }

  public isFromUser(user: User): boolean {
    return user._id === this.from;
  }

  public isToUser(user: User): boolean {
    return user._id === this.to;
  }

  public hasUserReadMessage(user: User): boolean {
    if (this.isFromUser(user)) {
      return this.fromReadAt !== undefined;
    }
    else if (this.isToUser(user)) {
      return this.toReadAt !== undefined;
    }
  }

  public markAsRead(user: User) {
    if (this.isFromUser(user)) {
      this.fromReadAt = new Date();
    }
    else if (this.isToUser(user)) {
      this.toReadAt = new Date();
    }
  }
}
