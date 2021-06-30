import {User} from "../user/base/user";
import {Message} from "./message";
import {Contractor} from "../user/contractor";
import {Customer} from "../user/customer";
import {Equals} from "../equals";

export class Conversation extends Equals {
  public you: User;
  public otherPerson: User;
  public otherPersonTyping: boolean;
  public messages: Array<Message>;

  constructor(obj?: any) {
    if (!obj) obj = {};
    super();

    this.you = obj.you && obj.you.__t === 'contractor' ? new Contractor(obj.you) : new Customer(obj.you);
    this.otherPerson = obj.otherPerson && obj.otherPerson.__t === 'contractor' ? new Contractor(obj.otherPerson) : new Customer(obj.otherPerson);
    this.otherPersonTyping = false;
    this.messages = [];

    for (let message of obj.messages || []) {
      this.messages.push(new Message(message));
    }

    if (this.messages.length > 0) {
      this.messages[this.messages.length - 1].viewTime = true;
    }
  }

  public getNumberOfUnreadMessages(): number {
    let unread = 0;
    this.messages.forEach(m => {
      if (!m.hasUserReadMessage(this.you)) {
        ++unread;
      }
    });
    return unread;
  }
}
