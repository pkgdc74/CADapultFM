import { AppSettings } from "../pages/settings/appsettingsstate";


export interface AppState{
    readonly dms:any[];
    readonly pms:any[];
    readonly appsettings:AppSettings
}