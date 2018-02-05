import { Action } from "@ngrx/store";
import { DataService } from "../providers/data-service";


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
    constructor(public payload: any, private ds: DataService) { }
    saveLocal(data) {
        this.ds.get("wos").then(wos => {
            wos = wos || { DMTasks: [] }
            wos.DMTasks = data
            this.ds.set("wos", wos)
        })
    }
}

export type DMActions = LoadLoacal | LoadRemote | Add | Save

export function dmreducer(state: any[] = [], action: DMActions) {
    switch (action.type) {
        case DMActionsTypes.DM_LOAD_LOCAL: {
            return action.payload;
        }
        case DMActionsTypes.DM_LOAD_REMOTE: {
            let result: any[] = [];
            state.forEach(v => {
                let i = action.payload.indexOf(x => x.requestid === v.requestid)
                if(i!=-1)
                    action.payload[i]=v;
                if(v.requestid==-1)
                    action.payload.push(v)
            })
            return action.payload;
        }
        case DMActionsTypes.DM_ADD: {
            return [...state, action.payload]
        }
        case DMActionsTypes.DM_SAVE: {
            let cs = state.map(item => {
                return item.requestid === action.payload.requestid
                    ? Object.assign({}, item, { value: action.payload })
                    : item;
            });
            action.saveLocal(cs)
            return cs;
        }
        default: {
            return state;
        }
    }
}

