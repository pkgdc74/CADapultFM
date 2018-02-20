import { AppState, FMTables } from "../appstate/app.state";
import { Action } from "@ngrx/store";

export class LoadTablesAction {
    readonly type: string = "FMCOMMON_LOAD_TABLES"
    constructor(public payload: any) { }
}
export const initfmtables: FMTables = {
    priority: [],
    documents:[],
    pmdmstatustypes:[]
}
export type Actions = LoadTablesAction
export function fmtablesreducer(state: FMTables = initfmtables, action: Actions) {
    switch (action.type) {
        case "FMCOMMON_LOAD_TABLES": {
            return action.payload
        }
        default:
            return state;
    }

}