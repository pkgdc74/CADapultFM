import { Action } from "@ngrx/store";

export enum ConnectionStatus {
    NotConnected = 0,
    Connected = 1
}
export interface AppSettings {
    url: string,
    cid: string,
    userid: string,
    password: string,
    offline: boolean,
    status: ConnectionStatus
}
export const defaultAppSettings: AppSettings = {
    url: "https://www.cadapultfm.com/fmcloudbeta", cid: "FMDemo", userid: "", password: "", offline: false, status: ConnectionStatus.NotConnected
}
export class AppSettingsSave implements Action{
    readonly type="APPSETTINGS_SAVE"
    constructor(public payload:any){}
}
export class AppSettingsLoad implements Action{
    readonly type="APPSETTINGS_SAVE"
    constructor(public payload:any){}
}
export type AppSettingsActions=AppSettingsSave
export function appsettingsreducer(state: AppSettings = defaultAppSettings, action:AppSettingsActions) {
    switch (action.type) {
        case "APPSETTINGS_SAVE": {
            return action.payload
        }
        default: {
            return state;
        }
    }
}
