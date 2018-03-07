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
    payload: any;
}

export class SyncQueueAdd implements Action {
    readonly type: string = "SYNCQUEUE_ADD";
    constructor(public command: ICommand) { }
}
export class SyncQueueRemove implements Action {
    readonly type: string = "SYNCQUEUE_REMOVE";
    constructor(public command: ICommand) { }
}
export class SyncQueueLoad implements Action {
    readonly type: string = "SYNCQUEUE_LOAD";
    constructor(public command:ICommand[]) { }
}

export type SyncQueueActions = SyncQueueAdd | SyncQueueRemove | SyncQueueLoad 

const initState: any[] = [];
export function syncQueueReducer(state: any[] = initState, action) {
    switch (action.type) {
        case "SYNCQUEUE_ADD": {
            action.command.syncid = new Date().getTime()
            return [...state, action.command]
        }
        case "SYNCQUEUE_REMOVE": {
            return state.filter(x => x.syncid != action.command.syncid)
        }
        case "SYNCQUEUE_LOAD":{
            return action.commands
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
    private syncqueue:any[]
    constructor(private store: Store<AppState>, private actions: Actions, private rmi: RMIService, private ds: DataService) {
        this.store.select("appsettings").subscribe(s => this.appsettings = s)
        this.store.select("syncqueue").subscribe(x=>{
            this.syncqueue=x
            this.ds.set("syncqueue",x)
        })
    }
    @Effect({ dispatch: false })
    add: Observable<Action> = this.actions.ofType<SyncQueueActions>("SYNCQUEUE_ADD")
        .do(action => {
            this.rmi.getProxy().then(proxy=>proxy.processCommandsAsync([action.command])).then(res=>{
                if(res[0].status=="OK")
                    this.store.dispatch({type:"SYNCQUEUE_REMOVE",command:action.command})
            }).catch(err=>console.log(err))
        })
    @Effect({ dispatch: false })
    process: Observable<Action> = this.actions.ofType<SyncQueueActions>("SYNCQUEUE_PROCESS")
        .do(action => {
            if (this.appsettings.offline) return;
            this.rmi.getProxy().then(proxy=>proxy.processCommandsAsync(this.syncqueue))
            .then(res=>{
                let filtered=this.syncqueue.filter(cmd => {
                    return res.findIndex(x=> x.syncid==cmd.syncid && x.status=="OK")==-1?true:false
                })
                this.store.dispatch({type:"SYNCQUEUE_LOAD",commands:filtered})
            }).catch(err=>console.log(err))
        })
}