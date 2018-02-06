import { Injectable } from "@angular/core";
import { Actions, Effect } from "@ngrx/effects";
import { Store, Action } from "@ngrx/store";
import { AppState } from "../../appstate/app.state";
import { Observable } from "rxjs";
import { DataService } from "../../providers/data-service";


@Injectable()
export class DMEffects {
    dm:Observable<AppState>
    constructor(private actions: Actions,private ds:DataService,private store:Store<AppState>) { 
        this.dm=store.select(state=>state)
    }
    @Effect({ dispatch: false })
    save: Observable<Action> = this.actions.ofType("DM_SAVE", "PM_SAVE")
        .do(action => {
           this.dm.subscribe(state=>console.log(state))
        })
}
