import { AppSettings } from "../pages/settings/appsettingsstate";

export interface FMTables{
    readonly priority:any[]
}
export interface AppState{
    readonly dms:any[];
    readonly pms:any[];
    readonly appsettings:AppSettings;
    readonly fmtables:FMTables
}
