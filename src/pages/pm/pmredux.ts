import { Action } from "@ngrx/store";
import { DataService } from "../../providers/data-service";


export class PMActionsTypes {
    static readonly PM_LOAD_LOCAL = "PM_LOAD_LOCAL";
    static readonly PM_LOAD_REMOTE = "PM_LOAD_REMOTE";
    static readonly PM_ADD = "PM_ADD";
    static readonly PM_CLOSE = "PM_CLOSE";
    static readonly PM_SAVE = "PM_SAVE";
}

export class LoadLoacal implements Action {
    readonly type = PMActionsTypes.PM_LOAD_LOCAL;
    constructor(public payload: any[]) { }
}
export class LoadRemote implements Action {
    readonly type = PMActionsTypes.PM_LOAD_REMOTE;
    constructor(public payload: any[]) { }
}
export class Add implements Action {
    readonly type = PMActionsTypes.PM_ADD
    constructor(public payload: any) { }
}

export class Save implements Action {
    readonly type = PMActionsTypes.PM_SAVE
    constructor(public payload: any, private ds: DataService) { }
    saveLocal(data) {
        this.ds.set("pms", data)
    }
}

export type PMActions = LoadLoacal | LoadRemote | Add | Save

export function pmreducer(state: any[] = [], action: PMActions) {
    switch (action.type) {
        case PMActionsTypes.PM_LOAD_LOCAL: {
            return action.payload;
        }
        case PMActionsTypes.PM_LOAD_REMOTE: {
            let remote=action.payload
            state.forEach(local=>{
                remote.forEach((remote,i,arr)=>{
                    if(remote.id===local.id)
                        arr[i]=local
                })
                if(local.id===-1)
                    remote.push(local)
            })
            return remote
        }
        case PMActionsTypes.PM_ADD: {
            return [...state, action.payload]
        }
        case PMActionsTypes.PM_SAVE: {
            let cs = state.map(item => {
                return item.id === action.payload.id
                    ? Object.assign({}, item, action.payload)
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

