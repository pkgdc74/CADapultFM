import { Injectable } from "@angular/core";
import { Actions, Effect } from "@ngrx/effects";
import { Store, Action } from "@ngrx/store";
import { AppState } from "../../appstate/app.state";
import { Observable } from "rxjs";
import { DataService } from "../../providers/data-service";
import { Security } from '../../providers/security';
import { AppSettings } from "./appsettingsstate";

@Injectable()
export class AppEffects {
    constructor(private actions: Actions, private ds: DataService, private store: Store<AppState>) {
        
    }
    
    @Effect({ dispatch: false })
    save: Observable<Action> = this.actions.ofType("APPSETTINGS_SAVE")
    .do(action=>{
        this.store.take(1).subscribe(state=>{
            this.ds.set("appsettings",{...state.appsettings,password:state.appsettings.password.e()})
            if(<AppSettings>action.payload.offline){
                this.ds.set("dms",state.dms)
                this.ds.set("pms",state.pms)
            }
        })
    })
}