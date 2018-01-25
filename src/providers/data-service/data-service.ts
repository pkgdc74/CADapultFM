
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class DataService {

  constructor(private storage:Storage) {
    
  }
  get(key:string):Promise<any>{
    return this.storage.get(key).then((d)=>{
      return d==null?null:JSON.parse(d)
    }).catch(d=>{
      console.log(d)
    })
  }
  set(key:string,data:any):Promise<any>{
    return this.storage.set(key,JSON.stringify(data))
  }
  startDataEngine(){
    //save locally first 
    //start engine with the connection settings passed
    console.log("starting the engine")
  }
}
