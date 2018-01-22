import { Component, ViewChild } from "@angular/core";


@Component({
    selector: "signature",
    templateUrl: "signature.component.html"
})
export class SignatureCompnenet {
    @ViewChild("canvas") canvas;

    constructor() {
    }
    clear() {
        var el = this.canvas.nativeElement;
        var g2d = el.getContext("2d");
        g2d.clearRect(0, 0, el.width, el.height)
    }
    ngAfterViewInit() {
        var el = this.canvas.nativeElement;
        var g2d = el.getContext("2d");
        let x: number, y: number;
        let ea = new ElementAdapter(el)
        let move = (e) => {
            e.preventDefault();
            e.stopPropagation()
            let evt = new EventAdapter(e);
            evt.setOffset(ea.offset())
            let pt = evt.getPoint()
            g2d.lineTo(x, y)
            g2d.stroke()
            x = pt.x;
            y = pt.y;
        }
        let start = (e) => {
            e.preventDefault();
            e.stopPropagation()
            let evt = new EventAdapter(e);
            evt.setOffset(ea.offset())
            let pt = evt.getPoint()
            x = pt.x;
            y = pt.y
            g2d.lineWidth = 5
            g2d.lineJoin = "round"
            g2d.lineCap = "round"
            g2d.beginPath()
            g2d.moveTo(x, y)
            el.addEventListener('touchmove', move)
            el.addEventListener('mousemove', move)
        }
        let isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        if (isTouch) {
            el.addEventListener('touchstart', start);
            el.addEventListener('touchend', (e) => {
                el.removeEventListener('touchmove', move)
            })
        } else {
            el.addEventListener('mousedown', start);
            el.addEventListener('mouseup', (e) => {
                el.removeEventListener('mousemove', move)
            })
        }
    }

    dataUrl() {
        return this.canvas.nativeElement.toDataURL()
    }

}

var EventAdapter = function (e) {
    var offset = { x: 0, y: 0 };
    this.getWheelRotation = function () {
        var delta = 0;
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        } else {
            delta = -e.deltaY / 3;
        }
        return Math.round(delta);
    };
    this.setOffset = function (o) {
        offset = o;
    };
    this.getPoint = function () {
        if (!!e.touches)
            return new Point(e.touches[0].pageX - offset.x, e.touches[0].pageY - offset.y);
        else
            return new Point(e.pageX - offset.x, e.pageY - offset.y);
    };
}
var ElementAdapter = function (e) {
    var offset = function (el) {
        var o = { x: 0, y: 0 };
        while (el) {
            o.x += el.offsetLeft
            o.y += el.offsetTop
            el = el.offsetParent
        }
        return o
    }
    var myOffset
    this.offset = function (force) {
        if (!myOffset || force == true) {
            return myOffset = offset(e)
        } else {
            return myOffset
        }
    }
}
var Point = function (x, y) {
    this.x = x = x || 0, this.y = y = y || 0;
    this.getX = function () {
        return x;
    }
    this.getY = function () {
        return y;
    }
    this.toString = function () {
        return "x: " + x + ", y: " + y;
    }
    this.setLocation = function (a, b) {
        this.x = x = a;
        this.y = y = b;
    }
    this.clone = function () {
        return new Point(x, y)
    }
    this.equals = function (p) {
        if (!p) return;
        return (x == p.x && y == p.y)
    }
}