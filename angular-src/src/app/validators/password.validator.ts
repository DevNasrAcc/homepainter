import {AbstractControl} from "@angular/forms";

const passwordRegExp: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"])[A-Za-z\d`~@!#$%^&*()\-_=+,<.>/?\\|\[\]{};:'"]{8,32}$/;

export function passwordValidator(control: AbstractControl): {[key: string]: any} | null {
  return passwordRegExp.test(control.value)
    ? null
    : {forbiddenPassword: {value: control.value}};
}
