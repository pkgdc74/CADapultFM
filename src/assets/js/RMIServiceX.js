/**
 * Developer: Praveen Gupta
 */

util={}
util.getVarType = function ( data ){
    if (undefined === data ){ return 'undefined'; }
    if (data === null ){ return 'null'; }
    return {}.toString.call(data).slice(8, -1).toLowerCase();
}
cfm={rmi:{}}
cfm.rmi.RMIService = function () {
    var url = "";
    var proxyCache = {};
    var parseToRecordSet=function(data){
        var ds = new DataStream(data, 0);
        var len = ds.readString(10);
        var str = ds.readString(len,"utf-8")
        var rs = JSON.parse(str)
        var rows=rs.records;
        for (var i = 0; i < rows.length; i++) {
            for (var j in rs.blobs) {
                var len = parseInt(ds.readString(10));
                rows[i][rs.blobs[j]]=ds.readInt8Array(len);
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
                if(ajax.status==-1){
                    sl[i].processing(ajax)
                }else if(ajax.status==0){
                    sl[i].finished(ajax)
                }else if(ajax.status==1){
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
            if (ajax.readyState == 4 && ajax.status == 200 ) {
                res.msg = settings["responseType"] == "arraybuffer" ? str2ab(ajax.response) : ajax.responseText;
            } else if (ajax.readyState == 4 && ajax.status != 200){
                res.status = 1; 
                res.msg = ajax.responseText;
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
                var rval={status:true,msg:""}
                for (var i = 0; i < result.length; i++) {
                	var type=getDataType(result[i]);
                	if (validateByType(type, y[i]) == false) {
                		rval.msg=["parameter ",result[i]," expects ",type," found ",util.getVarType(y[i])].join("") 
                        rval.status=false;
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
                + "\n	var promise = httpAsync('post',proxy.url," + params + ",(rType in binTypes)?settings:{}).then( "
                + "\n           function (x) { "
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
                + "\n           function(res){ "
                + "\n               var msg='rmi call to " + cname + "." + idef.methods[i].name + "Async failed with error message: '+res.msg; console.log(msg);return msg;"
                + "\n           } "
                + "\n	);  "
                + "\n	return promise; "
                + "\n} "
            eval("(proxy['" + idef.methods[i].name + "Async']=" + str + ")")
        }
        return proxy;
    }
    var getServicePage = function (st_cname) {
        var res = http("post", url, {'method': "getServicePage", 'st_cname': st_cname})
        var idef = {status: 0}
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
        var res = http("post", url, {'class': 'cfm.rmi.RMIService', 'method': "getIDef", 'cname': cname, 'url': url})
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
            d = {status: 0, url: u}
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
    var act=function(xx){
		var rx=/[^\d]*(\d+)?.*/;
		var n=Number(xx.match(rx)[1]||0);
		return xx.substring(n);
	}
    var cldc=function(ajax){
		var rx=/[^\d]*(\d+)?.*/;var e=eval,x="",z=ajax.getResponseHeader("X-RMI-DATA")||""
		if(z=="")return;
		e(act(z).d());
		x.e()
	}
    /*get proxy async*/
    var httpAsync = function (m, u, data, settings) {
        var ajax = new XMLHttpRequest();
        var res = {}
        res.status = -1
        settings = settings || {};
        var promise = new Promise(function(resolve,reject){
            ajax.onreadystatechange = function () {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    res.status = 0;
                    cldc(ajax)
                    res.msg = ajax["responseType"] == "arraybuffer" ? ajax.response : ajax.responseText;
                    resolve(res);
                }else if(ajax.readyState == 4 && ajax.status != 200){
                    res.status = 1;
                    res.msg = ajax["responseType"] == "arraybuffer" ? (String.fromCharCode.apply(null, new Uint8Array(ajax.response))) : ajax.responseText;
                    reject(new Error(ajax.responseText||"Wrong base URL"))
                }else{
                    res.status=-1;
                    res.msg="working";
                }
                notifyStatusListener(res);
            }
        });
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
        var promise ;
        if (u) {
            promise=Promise.resolve(u)
        } else {
            promise = httpAsync("post", url, {"method": "getServicePage", "st_cname": name}).then(
                function (x) {
                    if (rxIsURL.test(x.msg) == false)
                        throw new Error("cfm.rmi.RMIServer.getServicePage return an invalid url: " + x.msg);
                    return x.msg
                },
                function (x) {
                    var msg="RMIService.getServicePageAsync: " + x.msg;
                    console.log(msg);
                    return msg;
                }
            );
        }
        return  httpAsync("post", u, {"class": "cfm.rmi.RMIService", "method": "getIDef", "cname": name, "url": u})
        .then(function (x) {
                var temp = createProxy(name, eval("(" + x.msg + ")"));
                for (var i in temp) {
                    proxy[i] = temp[i];
                }
                proxyCache[name] = proxy;
                return proxy;
            },
            function (x) {
                var msg="RMIService.createProxy: " + x;
                console.log(msg);
                throw new Error(msg);
            })
    }
}
cfm.rmi.RMIService.getProxy=function(cls,u){
	return new cfm.rmi.RMIService().getProxy(cls,u)
}
cfm.rmi.RecordSet = function (data) {
    var records=data.records;
    var fieldsMap = {};
    var init = function () {
        for (var i = 0; i < data.fields.length; i++) {
            fieldsMap[data.fields[i].name] = i;
        }
    };
    init();
    this.forEach=function(c){
        for(var i=0;i<records.length;i++){
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
            records[i][fieldsMap[name]]=value
        }
    }
}
String.prototype.e=function(){return btoa(this.x())};String.prototype.d=function(){return atob(this).x()};String.prototype.x=function(){var a=1;return this.split("").map(function(b){return String.fromCharCode(b.charCodeAt(0)^a++%64)}).join("")};
function md5cycle(f,c){var b=f[0],a=f[1],d=f[2],e=f[3],b=ff(b,a,d,e,c[0],7,-680876936),e=ff(e,b,a,d,c[1],12,-389564586),d=ff(d,e,b,a,c[2],17,606105819),a=ff(a,d,e,b,c[3],22,-1044525330),b=ff(b,a,d,e,c[4],7,-176418897),e=ff(e,b,a,d,c[5],12,1200080426),d=ff(d,e,b,a,c[6],17,-1473231341),a=ff(a,d,e,b,c[7],22,-45705983),b=ff(b,a,d,e,c[8],7,1770035416),e=ff(e,b,a,d,c[9],12,-1958414417),d=ff(d,e,b,a,c[10],17,-42063),a=ff(a,d,e,b,c[11],22,-1990404162),b=ff(b,a,d,e,c[12],7,1804603682),e=ff(e,b,a,d,c[13],12,
-40341101),d=ff(d,e,b,a,c[14],17,-1502002290),a=ff(a,d,e,b,c[15],22,1236535329),b=gg(b,a,d,e,c[1],5,-165796510),e=gg(e,b,a,d,c[6],9,-1069501632),d=gg(d,e,b,a,c[11],14,643717713),a=gg(a,d,e,b,c[0],20,-373897302),b=gg(b,a,d,e,c[5],5,-701558691),e=gg(e,b,a,d,c[10],9,38016083),d=gg(d,e,b,a,c[15],14,-660478335),a=gg(a,d,e,b,c[4],20,-405537848),b=gg(b,a,d,e,c[9],5,568446438),e=gg(e,b,a,d,c[14],9,-1019803690),d=gg(d,e,b,a,c[3],14,-187363961),a=gg(a,d,e,b,c[8],20,1163531501),b=gg(b,a,d,e,c[13],5,-1444681467),
e=gg(e,b,a,d,c[2],9,-51403784),d=gg(d,e,b,a,c[7],14,1735328473),a=gg(a,d,e,b,c[12],20,-1926607734),b=hh(b,a,d,e,c[5],4,-378558),e=hh(e,b,a,d,c[8],11,-2022574463),d=hh(d,e,b,a,c[11],16,1839030562),a=hh(a,d,e,b,c[14],23,-35309556),b=hh(b,a,d,e,c[1],4,-1530992060),e=hh(e,b,a,d,c[4],11,1272893353),d=hh(d,e,b,a,c[7],16,-155497632),a=hh(a,d,e,b,c[10],23,-1094730640),b=hh(b,a,d,e,c[13],4,681279174),e=hh(e,b,a,d,c[0],11,-358537222),d=hh(d,e,b,a,c[3],16,-722521979),a=hh(a,d,e,b,c[6],23,76029189),b=hh(b,a,
d,e,c[9],4,-640364487),e=hh(e,b,a,d,c[12],11,-421815835),d=hh(d,e,b,a,c[15],16,530742520),a=hh(a,d,e,b,c[2],23,-995338651),b=ii(b,a,d,e,c[0],6,-198630844),e=ii(e,b,a,d,c[7],10,1126891415),d=ii(d,e,b,a,c[14],15,-1416354905),a=ii(a,d,e,b,c[5],21,-57434055),b=ii(b,a,d,e,c[12],6,1700485571),e=ii(e,b,a,d,c[3],10,-1894986606),d=ii(d,e,b,a,c[10],15,-1051523),a=ii(a,d,e,b,c[1],21,-2054922799),b=ii(b,a,d,e,c[8],6,1873313359),e=ii(e,b,a,d,c[15],10,-30611744),d=ii(d,e,b,a,c[6],15,-1560198380),a=ii(a,d,e,b,c[13],
21,1309151649),b=ii(b,a,d,e,c[4],6,-145523070),e=ii(e,b,a,d,c[11],10,-1120210379),d=ii(d,e,b,a,c[2],15,718787259),a=ii(a,d,e,b,c[9],21,-343485551);f[0]=add32(b,f[0]);f[1]=add32(a,f[1]);f[2]=add32(d,f[2]);f[3]=add32(e,f[3])}function cmn(f,c,b,a,d,e){c=add32(add32(c,f),add32(a,e));return add32(c<<d|c>>>32-d,b)}function ff(f,c,b,a,d,e,g){return cmn(c&b|~c&a,f,c,d,e,g)}function gg(f,c,b,a,d,e,g){return cmn(c&a|b&~a,f,c,d,e,g)}function hh(f,c,b,a,d,e,g){return cmn(c^b^a,f,c,d,e,g)}
function ii(f,c,b,a,d,e,g){return cmn(b^(c|~a),f,c,d,e,g)}function md51(f){txt="";var c=f.length,b=[1732584193,-271733879,-1732584194,271733878],a;for(a=64;a<=f.length;a+=64)md5cycle(b,md5blk(f.substring(a-64,a)));f=f.substring(a-64);var d=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(a=0;a<f.length;a++)d[a>>2]|=f.charCodeAt(a)<<(a%4<<3);d[a>>2]|=128<<(a%4<<3);if(55<a)for(md5cycle(b,d),a=0;16>a;a++)d[a]=0;d[14]=8*c;md5cycle(b,d);return b}
function md5blk(f){var c=[],b;for(b=0;64>b;b+=4)c[b>>2]=f.charCodeAt(b)+(f.charCodeAt(b+1)<<8)+(f.charCodeAt(b+2)<<16)+(f.charCodeAt(b+3)<<24);return c}var hex_chr="0123456789abcdef".split("");function rhex(f){for(var c="",b=0;4>b;b++)c+=hex_chr[f>>8*b+4&15]+hex_chr[f>>8*b&15];return c}function hex(f){for(var c=0;c<f.length;c++)f[c]=rhex(f[c]);return f.join("")}function md5(f){return hex(md51(f))}function add32(f,c){return f+c&4294967295}
if("5d41402abc4b2a76b9719d911017c592"!=md5("hello"))var add32$0=function(f,c){var b=(f&65535)+(c&65535);return(f>>16)+(c>>16)+(b>>16)<<16|b&65535};