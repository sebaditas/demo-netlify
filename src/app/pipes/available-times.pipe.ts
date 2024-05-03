// available-times.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import {Reservation} from "../../types";

@Pipe({
  standalone: true,
  name: 'availableTimes'
})
export class AvailableTimesPipe implements PipeTransform {

  transform(times: string[], reservations: Reservation[], userId: string): string[] {
    const userReservations = reservations.filter(reservation => reservation.rentorId === userId);
    const reservedTimes = userReservations.map(reservation => reservation.timeRange);
    return times.filter(time => !reservedTimes.includes(time));
  }

}
