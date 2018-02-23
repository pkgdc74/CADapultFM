import { Action, Store } from "@ngrx/store";
import { InitialState } from "@ngrx/store/src/models";
import { Injectable } from "@angular/core";
import { AppState } from "../appstate/app.state";
import { Actions, Effect } from "@ngrx/effects";
import { Observable } from "rxjs/Observable";
import { RMIService } from "../providers/rmiservice";
import { AppSettings } from "../pages/settings/appsettingsstate";
import { DataService } from "../providers/data-service";

export interface ICommand {
    syncid?: number;
    readonly name: string;
    readonly payload: any;
}

export class SyncQueueAdd implements Action {
    readonly type: string = "SYNCQUEUE_ADD";
    constructor(public command: ICommand) { }
}
export class SyncQueueRemove implements Action {
    readonly type: string = "SYNCQUEUE_REMOVE";
    constructor(public command: ICommand) { }
}

export type SyncQueueActions = SyncQueueAdd | SyncQueueRemove

const initState: any[] = [];
export function syncQueueReducer(state: any[] = initState, action: SyncQueueActions) {
    switch (action.type) {
        case "SYNCQUEUE_ADD": {
            action.command.syncid = new Date().getTime()
            return [...state, action.command]
        }
        case "SYNCQUEUE_REMOVE": {
            return state.filter(x => x.syncid != action.command.syncid)
        }
        case "SYNCQUEUE_PROCESS": {
            return state
        }
        default:
            return state;

    }
}

@Injectable()
export class SyncQueueEffects {
    private appsettings: AppSettings
    constructor(private store: Store<AppState>, private actions: Actions, private rmi: RMIService, private ds: DataService) {
        this.store.select("appsettings").subscribe(s => this.appsettings = s)
    }
    @Effect({ dispatch: false })
    add: Observable<Action> = this.actions.ofType<SyncQueueActions>("SYNCQUEUE_ADD")
        .do(action => {
            this.ds.get("syncqueue")
                .then(data => data == null ? [action.command] : [...data, action.command])
                .then(data => this.ds.set("syncqueue", data))
                .then(x => this.store.dispatch({ type: "SYNCQUEUE_PROCESS" }))
        })
    @Effect({ dispatch: false })
    process: Observable<Action> = this.actions.ofType<SyncQueueActions>("SYNCQUEUE_PROCESS")
        .do(action => {
            if (this.appsettings.offline) return;
            Promise.all([this.ds.get("syncqueue"), this.rmi.getProxy()])
            .then(res => {
                let [commands, proxy] = res;
                proxy.processCommandsAsync(commands).then(res => {
                    let filtered = commands.filter(cmd => {
                        return res.findIndex(x=> x.syncid==cmd.syncid && x.status=="OK")==-1?true:false
                    })
                    console.log(filtered)
                    this.ds.set("syncqueue", filtered)
                }).catch(err=>console.log(err))
            })
        })
}