import { Injectable } from "@angular/core";

declare var md5: any;
declare global {
  interface String {
    d() : string;
    e() : string;
    x() : string;
  }
}

@Injectable()
export class Security{
    constructor(){
    }
    authtoken(pass:string):string{
        let password:string  = String(new Date().getTime() + 10000);
        password = password + "-" + md5(password + pass);
        return password
    }
     encrypt(msg:string):string{
        return msg.e();
    }
     decrypt(msg:string):string{
        return msg.d();
    }
}