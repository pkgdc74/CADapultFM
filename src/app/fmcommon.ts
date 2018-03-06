import { FMTables } from "../appstate/app.state";

export class LoadTablesAction {
    readonly type: string = "FMCOMMON_LOAD_TABLES"
    constructor(public payload: any) { }
}

export const initfmtables: FMTables = {
    priority: [],
    documents: [],
    pmdmstatustypes: [],
    pmpartslabor: [],
    user:{}
}

export type FMTablesActions = LoadTablesAction

export function fmtablesreducer(state: FMTables = initfmtables, action: FMTablesActions) {
    switch (action.type) {
        case "FMCOMMON_LOAD_TABLES": {
            return action.payload
        }
        case "FMCOMMON_TABLES_ADDROW": {
            let x = [...state[action.payload.table], action.payload.row]
            return { ...state, [action.payload.table]: x }
        }
        case "FMCOMMON_TABLES_DELETEROW": {
            let x = state[action.payload.table].filter((i, idx) => idx != action.payload.idx)
            return { ...state, [action.payload.table]: x }
        }
        default:
            return state;
    }
}

