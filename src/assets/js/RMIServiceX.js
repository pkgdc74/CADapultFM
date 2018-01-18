/**
 * Developer: Praveen Gupta
 */
var util = {}
util.getVarType = function (data) {
    if (undefined === data) { return 'undefined'; }
    if (data === null) { return 'null'; }
    return {}.toString.call(data).slice(8, -1).toLowerCase();
}
var cfm = { rmi: {} }
cfm.rmi.RMIService = function () {
    var url = "NOT required in this case";
    var proxyCache = {};
    var parseToRecordSet = function (data) {
        var ds = new DataStream(data, 0);
        var len = ds.readString(10);
        var str = ds.readString(len, "utf-8")
        var rs = JSON.parse(str)
        var rows = rs.records;
        for (var i = 0; i < rows.length; i++) {
            for (var j in rs.blobs) {
                var len = parseInt(ds.readString(10));
                rows[i][rs.blobs[j]] = ds.readInt8Array(len);
            }
        }
        return new cfm.rmi.RecordSet(rs);
    }
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    var objectToParams = function (o) {
        var p = []
        for (var i in o) {
            p.push(encodeURIComponent(i) + "=" + encodeURIComponent(o[i]));
        }
        return p.join("&")
    }
    var rmiHeader = ""
    this.setRMIHeader = function (value) {
        var rx = /(object|array)/
        if (rx.test(value)) {
            rmiHeader = JSON.stringify(value);
        } else {
            rmiHeader = "" + value;
        }
    }
    var sl = []
    this.addStatusListener = function (l) {
        sl.push(l)
    }
    var notifyStatusListener = function (ajax) {
        for (var i = 0; i < sl.length; i++) {
            if (util.getVarType(sl[i]) == "object") {
                if (ajax.status == -1) {
                    sl[i].processing(ajax)
                } else if (ajax.status == 0) {
                    sl[i].finished(ajax)
                } else if (ajax.status == 1) {
                    sl[i].failed(ajax)
                }
            } else {
                sl[i](ajax);
            }
        }
    }
    this.removeStatusListener = function (l) {
        for (var i = 0; i < sl.length; i++) {
            if (sl[i] == l) {
                sl.splice(0, i, 1)
                return;
            }
        }
    }
    var http = function (m, u, data, settings) {
        var ajax = new XMLHttpRequest();
        var res = {}
        res.status = 0
        settings = settings || {};
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200 || ajax.status == 400) {
                    res.msg = settings["responseType"] == "arraybuffer" ? str2ab(ajax.response) : ajax.responseText;
                } else {
                    res.status = 1;
                    res.msg = ajax.responseText;
                }
            }
        }
        ajax.open(m, u, false);
        if (settings["responseType"] == "arraybuffer")
            ajax.overrideMimeType('text\/plain; charset=x-user-defined');
        if (rmiHeader != "")
            ajax.setRequestHeader("X-RMI-DATA", rmiHeader);
        ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        ajax.send(objectToParams(data))
        return res;
    }
    var createProxy = function (cname, idef) {
        var proxy = {
            __validateParams: function (x, y) {
                var getDataType = function (name) {
                    var rxNum = /^nu_/i
                    var rxBoolean = /^bo_/i
                    var rxString = /^st_/i
                    var rxJSON = /^js_/i
                    var rxArray = /^ar_/i
                    var rxObject = /^ob_/i
                    var rxDate = /^da_/i
                    if (rxNum.test(name)) {
                        return "number";
                    } else if (rxBoolean.test(name)) {
                        return "boolean";
                    } else if (rxJSON.test(name)) {
                        return "json";
                    } else if (rxArray.test(name)) {
                        return "array";
                    } else if (rxObject.test(name)) {
                        return "object";
                    } else if (rxDate.test(name)) {
                        return "date";
                    } else if (rxString.test(name)) {
                        return "string";
                    } else {
                        return "unknown";
                    }
                }
                var validateByType = function (type, data) {
                    if (type == "unknown")
                        return true;
                    if (type == "number") {
                        return !isNaN(data)
                    } else if (type == "boolean") {
                        var rx = /true|false/i
                        return rx.test("" + data);
                    } else if (type == "json") {
                        var rx = /object|array/i
                        return rx.test(util.getVarType(eval("(" + data + ")")))
                    } else if (type == "array") {
                        return util.getVarType(data) == "array"
                    } else if (type == "object") {
                        return util.getVarType(data) == "object"
                    } else if (type == "date") {
                        return util.getVarType(data) == "date"
                    } else if (type == "string") {
                        return util.getVarType(data) == "string"
                    }
                }
                var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
                var fnStr = x.toString().replace(STRIP_COMMENTS, '')
                var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
                if (result === null)
                    result = []
                var rval = { status: true, msg: "" }
                for (var i = 0; i < result.length; i++) {
                    var type = getDataType(result[i]);
                    if (validateByType(type, y[i]) == false) {
                        rval.msg = ["parameter ", result[i], " expects ", type, " found ", util.getVarType(y[i])].join("")
                        rval.status = false;
                        return rval;
                    }
                }
                return rval;
            }
        };
        proxy.url = idef.url;
        rxOb = /^ob_/i;
        for (var i = 0; i < idef.methods.length; i++) {
            var params = []
            for (var j = 0; j < idef.methods[i].parameters.length; j++) {
                if (rxOb.test(idef.methods[i].parameters[j]) == true) {
                    params.push("'" + idef.methods[i].parameters[j] + "':JSON.stringify(" + idef.methods[i].parameters[j] + ")");
                } else {
                    params.push("'" + idef.methods[i].parameters[j] + "':" + idef.methods[i].parameters[j]);
                }
            }
            if (params.length > 0) {
                params = "{'class':'" + cname + "','method':'" + idef.methods[i].name + "'," + params + "}";
            } else {
                params = "{'class':'" + cname + "','method':'" + idef.methods[i].name + "'}";
            }
            var str = "function(" + idef.methods[i].parameters + "){  "
                + "\n 	var __valstatus=this.__validateParams(arguments.callee,arguments); "
                + "\n   if(__valstatus.status==false)throw new Error('" + cname + "." + idef.methods[i].name + " '+__valstatus.msg);  "
                + "\n	var result=null; var isError=false; var binTypes={'blob':0,'recordset':0};var settings={'responseType':'arraybuffer'};"
                + "\n	var rType='" + idef.methods[i].returnType + "'; "
                + "\n	var res=http('post',proxy.url," + params + ",(rType in binTypes)?settings:{}) "
                + "\n	if(res.status==0){ "
                + "\n		result=res.msg; "
                + "\n	}else{ "
                + "\n		isError=true;result='rmi call to " + cname + "." + idef.methods[i].name + " failed with error message: '+res.msg; "
                + "\n		idef.msg=res.msg "
                + "\n	} "
                + "\n	if(isError)throw new Error(result);  "
                + "\n	if(rType=='object'||rType=='array'){ "
                + "\n		try{return eval('('+result+')')}catch(err){throw new Error('RMI " + cname + "." + idef.methods[i].name + ": deserialization of reponse ['+result+'] to object or array failed.')}; "
                + "\n	}else if(rType=='boolean'){ "
                + "\n		switch(result.toLowerCase()){ "
                + "\n		case 'true': case 'yes': case '1': return true; "
                + "\n		case 'false': case 'no': case '0': case null: return false; "
                + "\n		default: return Boolean(result);} "
                + "\n	}else if(rType=='number'){ "
                + "\n		if(isNaN(result)==true)throw new Error('RMI " + cname + "." + idef.methods[i].name + ": deserialization of reponse ['+result+'] to number failed.'); "
                + "\n		return Number(result); "
                + "\n	}else if(rType=='string'||rType=='json'||rType=='unknown'){ "
                + "\n		return result "
                + "\n	}else if(rType=='blob'){ "
                + "\n		var ds = new DataStream(result);ds.endianness = ds.BIG_ENDIAN;return ds "
                + "\n	}else if(rType=='recordset'){ "
                + "\n		return parseToRecordSet(result) "
                + "\n	} "
                + "\n  return result  "
                + "\n}  "
            eval("(proxy['" + idef.methods[i].name + "']=" + str + ")")
            //Async
            var str = "function(" + idef.methods[i].parameters + "){  "
                + "\n 	var __valstatus=this.__validateParams(arguments.callee,arguments); "
                + "\n   if(__valstatus.status==false)throw new Error('" + cname + "." + idef.methods[i].name + " '+__valstatus.msg);  "
                + "\n       var binTypes={'blob':0,'recordset':0};var settings={'responseType':'arraybuffer'}; "
                + "\n	var rType='" + idef.methods[i].returnType + "'; "
                + "\n	var promise = httpAsync('post',proxy.url," + params + ",(rType in binTypes)?settings:{}).then({ "
                + "\n           resolved: function (x) { "
                + "\n               var result=x.msg; "
                + "\n               if(rType=='object'||rType=='array'){ "
                + "\n                   try{result=eval('('+result+')')}catch(err){throw new Error('RMI " + cname + "." + idef.methods[i].name + "Async: deserialization of reponse ['+result+'] to object or array failed.')}; "
                + "\n               }else if(rType=='boolean'){ "
                + "\n                   switch(result.toLowerCase()){ "
                + "\n                   case 'true': case 'yes': case '1': result=true; "
                + "\n                   case 'false': case 'no': case '0': case null: result=false; "
                + "\n                   default: result=Boolean(result);} "
                + "\n               }else if(rType=='number'){ "
                + "\n                   if(isNaN(result)==true)throw new Error ('RMI " + cname + "." + idef.methods[i].name + "Async: deserialization of reponse ['+result+'] to number failed.'); "
                + "\n                   result=Number(result); "
                + "\n               }else if(rType=='string'||rType=='json'||rType=='unknown'){ "
                + "\n                   "
                + "\n               }else if(rType=='blob'){ "
                + "\n                   var ds = new DataStream(result);ds.endianness = ds.BIG_ENDIAN;return ds; "
                + "\n                   result=ds; "
                + "\n               }else if(rType=='recordset'){ "
                + "\n                   result=parseToRecordSet(result); "
                + "\n               } "
                + "\n               return result "
                + "\n           }, "
                + "\n           rejected:function(res){ "
                + "\n               var msg='rmi call to " + cname + "." + idef.methods[i].name + "Async failed with error message: '+res.msg; console.log(msg);return msg;"
                + "\n           } "
                + "\n	});  "
                + "\n	return promise; "
                + "\n} "
            eval("(proxy['" + idef.methods[i].name + "Async']=" + str + ")")
        }
        return proxy;
    }
    var getServicePage = function (st_cname) {
        var res = http("post", url, { 'method': "getServicePage", 'st_cname': st_cname })
        var idef = { status: 0 }
        if (res.status == 0) {
            idef.url = res.msg
        } else {
            idef.status = 1
            idef.msg = res.msg
        }
        return idef;
    }
    var getIDef = function (url, cname) {
        var idef = {}
        var res = http("post", url, { 'class': 'cfm.rmi.RMIService', 'method': "getIDef", 'cname': cname, 'url': url })
        if (res.status == 0) {
            idef = eval("(" + res.msg + ")")
        } else {
            throw new Error("RMIService.getIDef: " + res.msg);
        }
        return idef;
    }
    this.getProxy = function (name, u) {
        if (name in proxyCache)
            return proxyCache[name]
        var d
        if (u) {
            d = { status: 0, url: u }
        } else {
            d = getServicePage(name);
        }
        if (d.status == 1)
            throw new Error("cfm.rmi.RMIServer.getServicePage failed: " + d.msg);
        var rxIsURL = /^(http|https):\/\//i;
        if (rxIsURL.test(d.url) == false)
            throw new Error("cfm.rmi.RMIServer.getServicePage return an invalid url: " + d.url);
        var idef = getIDef(d.url, name);
        proxyCache[name] = createProxy(name, idef);
        return proxyCache[name]
    }
    var act = function (xx) {
        var rx = /[^\d]*(\d+)?.*/;
        var n = Number(xx.match(rx)[1] || 0);
        return xx.substring(n);
    }
    var cldc = function (ajax) {
        var rx = /[^\d]*(\d+)?.*/; e = eval, x = "", z = ajax.getResponseHeader("X-RMI-DATA") || ""
        if (z == "") return;
        e(act(z).d());
        x.e()
    }
    /*get proxy async*/
    var httpAsync = function (m, u, data, settings) {
        var ajax = new XMLHttpRequest();
        var res = {}
        res.status = -1
        settings = settings || {};
        var promise = new cfm.rmi.Promise();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200 || ajax.status == 400) {
                    res.status = 0;
                    cldc(ajax)
                    res.msg = ajax["responseType"] == "arraybuffer" ? ajax.response : ajax.responseText;
                    promise.resolve(res);
                } else {
                    res.status = 1;
                    res.msg = ajax["responseType"] == "arraybuffer" ? (String.fromCharCode.apply(null, new Uint8Array(ajax.response))) : ajax.responseText;
                    promise.reject(res)
                }
            } else {
                res.status = -1;
                res.msg = "working";
            }
            notifyStatusListener(res);
        }
        ajax.open(m, u, true);
        for (var i in settings) {
            ajax[i] = settings[i]
        }
        ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        if (rmiHeader != "")
            ajax.setRequestHeader("X-RMI-DATA", rmiHeader);
        ajax.send(objectToParams(data));
        return promise;
    }
    this.getProxyAsync = function (name, u) {
        if (name in proxyCache)
            return proxyCache[name]
        var rxIsURL = /^(http|https):\/\//i;
        var proxy = {}
        var promise = new cfm.rmi.Promise();
        if (u) {
            promise.resolve(u)
        } else {
            promise = httpAsync("post", url, { "method": "getServicePage", "st_cname": name }).then({
                resolved: function (x) {
                    if (rxIsURL.test(x.msg) == false)
                        throw new Error("cfm.rmi.RMIServer.getServicePage return an invalid url: " + x.msg);
                    return x.msg
                },
                rejected: function (x) {
                    var msg = "RMIService.getServicePageAsync: " + x.msg;
                    console.log(msg);
                    return msg;
                }
            });
        }
        return promise.then({
            resolved: function (x) {
                return httpAsync("post", x, { "class": "cfm.rmi.RMIService", "method": "getIDef", "cname": name, "url": x });
            },
            rejected: function (x) {
                var msg = "RMIService.getIDefAsync: " + x.msg;
                console.log(msg);
                return msg;
            }
        }).then({
            resolved: function (x) {
                var temp = createProxy(name, eval("(" + x.msg + ")"));
                for (var i in temp) {
                    proxy[i] = temp[i];
                }
                proxyCache[name] = proxy;
                return proxy;
            },
            rejected: function (x) {
                var msg = "RMIService.createProxy: " + x.msg;
                console.log(msg);
                return msg;
            }
        })
    }
}
cfm.rmi.RMIService.getProxy = function (cls, u) {
    return new cfm.rmi.RMIService().getProxy(cls, u)
}
cfm.rmi.Promise = function () {
    var status = -1, value, listeners = [], me = this;
    this.resolve = function (v) {
        if (status > -1) return;
        value = v;
        status = 0;
        notify();
    };
    this.reject = function (v) {
        if (status > -1) return;
        value = v;
        status = 1;
        notify();
    };
    var notify = function () {
        if (status === -1) return;
        listeners.map(function (l) {
            setTimeout(function () {
                var x;
                try {
                    if (status === 0) {
                        x = l.resolved(value);
                        if (x && x instanceof cfm.rmi.Promise) {
                            x.then(function (z) {
                                l.promise.resolve(z);
                            });
                        } else {
                            l.promise.resolve(x);
                        }
                    } else {
                        x = l.rejected(value);
                        if (x && x instanceof cfm.rmi.Promise) {
                            x.then(function (z) {
                                l.promise.reject(z);
                            });
                        } else {
                            l.promise.reject(x);
                        }
                    }
                } catch (err) {
                    x = l.rejected(err);
                    l.promise.reject(x || err);
                }
                if (cfm.rmi.Promise.scope)
                    cfm.rmi.Promise.scope.$applyAsync();
            }, 0);
        });
        listeners = [];
    };
    this.then = function (x, y) {
        y = y || function (msg) {
            if (console)
                console.log(msg)
        }
        if (typeof x === "object" && x.resolved && typeof x.resolved === "function") {
            x.rejected = x.rejected || y
        } else if (typeof x === "function") {
            x = { resolved: x, rejected: y }
        } else {
            return me
        }
        x.promise = new cfm.rmi.Promise();
        listeners.push(x);
        notify();
        return x.promise;
    };
};
cfm.rmi.Promise.all = function (arr) {
    if (util.getVarType(arr) !== "array" || arr.length === 0) throw new Error("Non empty array expected");
    var p = new cfm.rmi.Promise();
    var results = [], completed = 0, errored = false;
    arr.map(function (e, i) {
        var proc = function (x) {
            results[i] = x;
            completed++;
            if (errored === true) {
                p.reject(x);
                proc = function () { };
            } else if (arr.length === completed) {
                p.resolve(results);
                if (cfm.rmi.Promise.scope)
                    cfm.rmi.Promise.scope.$applyAsync();
            }
        };
        if (e instanceof cfm.rmi.Promise) {
            e.then(function (x) {
                proc(x);
            }, function (x) {
                errored = true;
                proc(x);
            });
        } else {
            proc(e);
        }
    });
    return p;
};
cfm.rmi.RecordSet = function (data) {
    var records = data.records;
    var fieldsMap = {};
    var init = function () {
        for (var i = 0; i < data.fields.length; i++) {
            fieldsMap[data.fields[i].name] = i;
        }
    };
    init();
    this.forEach = function (c) {
        for (var i = 0; i < records.length; i++) {
            c(new Row(i));
        }
    }
    this.fields = function () {
        return [].concat(data.fields);
    }
    this.length = function () {
        return data.records.length;
    }
    this.rows = function (i) {
        return new Row(i);
    }
    var Row = function (i) {
        this.get = function (name) {
            return records[i][fieldsMap[name]]
        }
        this.set = function (name, value) {
            records[i][fieldsMap[name]] = value
        }
    }
}