import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeUsed',
})
export class TimeUsedPipe implements PipeTransform {
  private hour = 1000 * 60 * 60;
  private min = 1000 * 60;
  private sec = 1000;

  transform(diff) {
    let h = "" + Math.floor(diff / this.hour);
    let m = ("0" + (Math.floor(diff / this.min) % 60)).slice(-2);
    let s = ("0" + (Math.round(diff / this.sec) % 60)).slice(-2);
    return h+":"+m+":"+s;
  }
}
