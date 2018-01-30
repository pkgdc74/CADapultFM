
declare var md5: any;
declare global {
    interface String {
        d(): string;
        e(): string;
        x(): string;
    }
}
export class Security {
    static authtocken(pass: string): string {
        let password: any = new Date().getTime() + 10000;
        password = password + "-" + md5(password + "" + pass);
        return password
    }
    static validateTocken(x: string, pass: string): boolean {
        let time = x.split("-")
        if (new Date().getTime() > Number(time[0])) return false;
        return md5(time[0] + pass) == time[1]
    }
    static decript(msg:string):string{
        return msg.d();
    }
    static encrypt(msg:string):string{
        return msg.e();
    }
}