import {AbstractControl} from "@angular/forms";

const emailAddressRegExp: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function emailAddressValidator(control: AbstractControl): {[key: string]: any} | null {
  return emailAddressRegExp.test(control.value)
    ? null
    : {forbiddenEmailAddress: {value: control.value}};
}
