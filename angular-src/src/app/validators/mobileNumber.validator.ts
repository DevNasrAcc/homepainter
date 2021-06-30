import {AbstractControl} from "@angular/forms";

const mobileNumberRegExp: RegExp = /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/;

export function mobileNumberValidator(control: AbstractControl): {[key: string]: any} | null {
  return mobileNumberRegExp.test(control.value)
    ? null
    : {forbiddenTelNumber: {value: control.value}};
}
