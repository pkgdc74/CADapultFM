import { Injectable } from "@angular/core";
import { Actions, Effect } from "@ngrx/effects";
import { Store, Action } from "@ngrx/store";
import { AppState } from "../../appstate/app.state";
import { Observable } from "rxjs";
import { DataService } from "../../providers/data-service";
import { RMIService } from "../../providers/rmiservice";
import { Save } from "./dmredux";

@Injectable()
export class DMEffects {
    private dms: any[]
    constructor(private actions: Actions, private ds: DataService,
        private store: Store<AppState>, private rmi: RMIService) {
            this.store.select(x=>x.dms).subscribe(dms=>this.dms=dms)
            this.store.select("dms").subscribe(dms=>this.dms=dms)

    }
    @Effect({ dispatch: false })
    save: Observable<Action> = this.actions.ofType("DM_SAVE")
        .do(action => {
            this.ds.set("dms",this.dms)
        })    

    // @Effect({ dispatch: false })
    // save: Observable<Action> = this.actions.ofType<Save>("DM_SAVE")
    //     .do(action => {
    //         this.store.take(1).subscribe((store) => {
    //             this.ds.set("dms", store.dms)
    //             let wo: any = action.payload
    //             if(!store.appsettings.offline)
    //             this.rmi.getProxy().then(proxy=>{
    //                 return proxy.saveDMAsync(wo.requestid, wo.techstatus, wo.techcomments)
    //             }).then(x => {
    //                 //this.ds.reload()
    //             })
            
    //         })
    //     })

}
