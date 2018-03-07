import { AppSettings } from "../pages/settings/appsettingsstate";

export interface PMPartslabor {
    id: number,
    maintid: number,
    mainttype: string,
    type: string,
    hours: number,
    rate: number,
    description: string,
    partcost: number,
    partqty: number,
    workingdate: Date,
    uuid: string
}

export interface FMTables {
    readonly priority: any[]
    readonly documents: any[]
    readonly pmdmstatustypes: any[]
    readonly pmpartslabor: PMPartslabor[]
    readonly pmdmrequestswip:any[]
    readonly appvars:any
    readonly user:any;
}
export interface AppState {
    readonly dms: any[];
    readonly pms: any[];
    readonly appsettings: AppSettings;
    readonly fmtables: FMTables;
    readonly syncqueue: any[]
}
