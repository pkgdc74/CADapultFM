import { Component, DoCheck, Input} from '@angular/core';

@Component({
  selector: 'wip',
  templateUrl: 'wip.html'
})
export class WipComponent implements DoCheck {
  private diff:number=0
  private clear
 
  @Input("startTime")
  public st: number=0;

  constructor() {
  }

  ngDoCheck() {
    if(this.st>0)
      this.start();
    else
      this.stop();
  }

  start() {
    this.st = this.st==0? new Date().getTime():this.st;
    this.clear = setInterval(() => {
      this.diff = new Date().getTime()-this.st;
    }, 1000)
  }

  stop() {
    clearInterval(this.clear)
    this.st=0;
    //this.diff=0
  }
}