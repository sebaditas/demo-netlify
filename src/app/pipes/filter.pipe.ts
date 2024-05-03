import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(availableHours: any[], reservedHours: any[]): any[] {
    return availableHours.filter(hour => !reservedHours.includes(hour.value));
  }
}
