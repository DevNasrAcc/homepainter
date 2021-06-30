import { Pipe } from "@angular/core";

@Pipe({
  name: "phone"
})
export class Phone {
  transform(phoneNumber) {
    let phoneNumberString = phoneNumber.toString();

    let match = phoneNumberString.match(/(\+1)?(\d{3})(\d{3})(\d{4})$/);

    if (!match) {
      throw new Error(`value [${phoneNumberString}] is not a valid phone number`);
    }

    return '(' + match[2] + ') ' + match[3] + '-' + match[4];
  }
}
