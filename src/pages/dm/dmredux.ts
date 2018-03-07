import { Injectable } from "@angular/core";
import { AppState } from "../../appstate/app.state";
import { Store, Action } from "@ngrx/store";
import { DataService } from "../../providers/data-service";
import { Actions, Effect } from "@ngrx/effects";
import { Observable } from "rxjs";

export class DMActionsTypes {
    static readonly DM_LOAD_LOCAL = "DM_LOAD_LOCAL";
    static readonly DM_LOAD_REMOTE = "DM_LOAD_REMOTE";
    static readonly DM_ADD = "DM_ADD";
    static readonly DM_CLOSE = "DM_CLOSE";
    static readonly DM_SAVE = "DM_SAVE";
}

export class LoadLoacal implements Action {
    readonly type = DMActionsTypes.DM_LOAD_LOCAL;
    constructor(public payload: any[]) { }
}
export class LoadRemote implements Action {
    readonly type = DMActionsTypes.DM_LOAD_REMOTE;
    constructor(public payload: any[]) { }
}
export class Add implements Action {
    readonly type = DMActionsTypes.DM_ADD
    constructor(public payload: any) { }
}

export class Save implements Action {
    readonly type = DMActionsTypes.DM_SAVE
    constructor(public payload: any) { }
}

export type DMActions = LoadLoacal | LoadRemote | Add | Save

export function dmreducer(state: any[] = [], action: DMActions) {
    switch (action.type) {
        case DMActionsTypes.DM_LOAD_LOCAL: {
            return action.payload;
        }
        // case DMActionsTypes.DM_LOAD_REMOTE: {
        //     let remote = action.payload
        //     state.forEach(local => {
        //         remote.forEach((remote, i, arr) => {
        //             if (remote.requestid === local.requestid && local.userTouched)
        //                 arr[i] = local
        //         })
        //         if (local.requestid === -1)
        //             remote.push(local)
        //     })
        //     return remote
        // }
        case DMActionsTypes.DM_ADD: {
            return [...state, action.payload]
        }
        case DMActionsTypes.DM_SAVE: {
            let cs = state.map(item => {
                return item.requestid === action.payload.requestid
                    ? Object.assign({}, item, action.payload)
                    : item;
            });
            return cs;
        }
        default: {
            return state;
        }
    }
}

