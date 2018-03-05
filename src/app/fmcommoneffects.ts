import { FMTables, AppState } from "../appstate/app.state";
import { Store, Action } from "@ngrx/store";
import { Actions, Effect } from "@ngrx/effects";
import { DataService } from "../providers/data-service";
import { Observable } from "rxjs/Observable";
import { Injectable } from "@angular/core";

@Injectable()
export class FMTablesEffects {
    private fmtables: FMTables
    constructor(private store: Store<AppState>, private actions: Actions, private ds: DataService) {
        this.store.select("fmtables").subscribe(s => this.fmtables = s)
    }
    @Effect({ dispatch: false })
    add: Observable<Action> = this.actions.ofType("FMCOMMON_TABLES_ADDROW","FMCOMMON_TABLES_DELETEROW")
        .do(action => {
            this.ds.set("fmtables",this.fmtables)
        })    
}