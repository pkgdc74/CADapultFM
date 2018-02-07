import { Injectable } from "@angular/core";
import { Actions, Effect } from "@ngrx/effects";
import { Store, Action } from "@ngrx/store";
import { AppState } from "../../appstate/app.state";
import { Observable } from "rxjs";
import { DataService } from "../../providers/data-service";

@Injectable()
export class DMEffects {
    constructor(private actions: Actions, private ds: DataService, private store: Store<AppState>) {
        this.store.sample(this.save).subscribe((store)=>{
            console.log(store.dms)
            this.ds.set("dms",store.dms)
        })
    }

    @Effect({ dispatch: false })
    save: Observable<Action> = this.actions.ofType("DM_SAVE")
        /*.do(action => {
            this.store.first().subscribe(state=>{
                this.ds.set("dms",state.dms)

            })
        })*/
}
