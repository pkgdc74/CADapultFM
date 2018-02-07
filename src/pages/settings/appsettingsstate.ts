import { Injectable } from "@angular/core";
import { Actions, Effect } from "@ngrx/effects";
import { Store, Action } from "@ngrx/store";
import { AppState } from "../../appstate/app.state";
import { Observable } from "rxjs";
import { DataService } from "../../providers/data-service";
import {Security} from "../../providers/security"

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

export class AppSettingsLoad implements Action{
    readonly type="APPSETTINGS_LOAD"
    constructor(public payload:any){}
}
export class AppSettingsSave implements Action{
    readonly type="APPSETTINGS_SAVE"
    constructor(public payload:any){}
}
export type AppSettingsActions=AppSettingsLoad|AppSettingsSave
export function appsettingsreducer(state: AppSettings = defaultAppSettings, action:AppSettingsActions) {
    switch (action.type) {
        case "APPSETTINGS_SAVE": 
        case "APPSETTINGS_LOAD": {
            return action.payload
        }
        default: {
            return state;
        }
    }
}

