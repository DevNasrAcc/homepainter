import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'storageName2DisplayName'})
export class StorageName2DisplayName implements PipeTransform {
  public transform(value: string): string {
    const result = value
      .replace(/([A-Z])/g, ' $1') // Puts a space before each capital letter: 'homePainter' => 'home Painter'
      .replace(/(-)([a-z])/g, ' / $2') // Replaces a dash with a slash: 'home-painter' => 'home / painter'
      .replace(/ [a-z]/g, $0 => $0.replace($0, $0.toUpperCase())); // Capitalizes the first letter of each word that follows a space

    return result.charAt(0).toUpperCase() + result.slice(1); // capitalizes the first letter of the first word
  }
}
