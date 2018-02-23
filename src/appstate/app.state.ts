import { AppSettings } from "../pages/settings/appsettingsstate";

export interface FMTables{
    readonly priority:any[]
    readonly documents:any[]
    readonly pmdmstatustypes:any[]
    readonly dmlabor:any[]
    readonly dmpart:any[]
    readonly pmlabor:any[]
    readonly pmpart:any[]
}
export interface AppState{
    readonly dms:any[];
    readonly pms:any[];
    readonly appsettings:AppSettings;
    readonly fmtables:FMTables;
    readonly syncqueue:any[]
}
