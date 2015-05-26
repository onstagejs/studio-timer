var callCb = function(error,result,cb,initialTime,sender, receiver, message, headers){
  var totalTime = new Date().getTime() - initialTime;
  setImmediate(function(){
    cb(error,{
      time:totalTime,
      message : {
        sender : sender,
        receiver : receiver,
        message : message,
        headers : headers
      },
      result: result
    });
  });
};
module.exports = function(cb,filter){
  return function(opt){
    opt.listenTo.onCreateActor(function(actor){
      var _process = actor.process.bind(actor);
      actor.process = function(body,headers,sender,receiver){
        if(!filter || filter({sender:sender,receiver:receiver,body:body,headers:headers})){
          var initialTime = new Date().getTime();
          var res = _process(body,headers,sender,receiver);
          if(res && res.constructor.name==='Promise'){
            return res.then(function(result){
              callCb(null,result,cb,initialTime,sender, receiver, body, headers);
              return result;
            }).catch(function(err){
              callCb(err,null,cb,initialTime,sender, receiver, body, headers);
              throw err;
            });
          }else{
            callCb(null,res,cb,initialTime,sender, receiver, body, headers);
            return res;
          }
        }else{
          return _process(body,headers,sender,receiver);
        }
      };
      actor.unsubscribe();
      actor.unsubscribe = actor.stream.onValue(actor._doProcess);
    });
  };
};
