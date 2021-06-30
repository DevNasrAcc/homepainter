import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'limitMessage'})
export class LimitMessage implements PipeTransform {
  transform(value: string): string {
    if (value.length > 48) {
      value = value.substring(0, 48);
      value += '...';
    }

    return value;
  }
}
