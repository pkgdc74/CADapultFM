import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'wip',
  templateUrl: 'wip.html'
})
export class WipComponent implements OnInit {
  diff: { h: string, m: string, s: string } = { h: "0", m: "00", s: "00" }
  st: number
  clear
  public started: boolean = false;
  constructor() {

  }
  hour = 1000 * 60 * 60;
  min = 1000 * 60;
  sec = 1000
  getTimeDiff(et, st) {
    let diff = et - st;
    let h = "" + Math.floor(diff / this.hour)
    let m = ("0" + (Math.floor(diff / this.min) % 60)).slice(-2)
    let s = ("0" + (Math.round(diff / (1000)) % 60)).slice(-2)
    return {
      h: h, m: m, s: s
    }
  }
  ngOnInit() {
  }
  

  start() {
    this.st = new Date().getTime()
    this.clear = setInterval(() => {
      this.diff = this.getTimeDiff(new Date().getTime(), this.st)
    }, 1000)
    this.started = true
  }
  stop() {
    clearInterval(this.clear)
    this.diff = { h: "0", m: "00", s: "00" }
    this.started = false
  }
}
