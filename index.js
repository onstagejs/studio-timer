var callCbActor = function(error,result,cb,initialTime,sender, receiver, message, headers){
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
var onCreateActorListener = function(cb,filter){
  filter = filter || function(){return true;};
  return function(actor){
    if(cb && filter(actor)){
      var _process = actor.process.bind(actor);
      actor.process = function(body,headers,sender,receiver){
        var initialTime = new Date().getTime();
        var res = _process(body,headers,sender,receiver);
        if(res && res.constructor.name==='Promise'){
          return res.then(function(result){
            callCbActor(null,result,cb,initialTime,sender, receiver, body, headers);
            return result;
          }).catch(function(err){
            callCbActor(err,null,cb,initialTime,sender, receiver, body, headers);
            throw err;
          });
        }else{
          callCbActor(null,res,cb,initialTime,sender, receiver, body, headers);
          return res;
        }
      };
      actor.unsubscribe();
      actor.unsubscribe = actor.stream.onValue(actor._doProcess);
    }
  }
};
var callCbDriver = function(error,result,cb,initialTime,driver){
  var totalTime = new Date().getTime() - initialTime;
  setImmediate(function(){
    cb(error,{
      time:totalTime,
      driver:driver,
      result: result
    });
  });
};
var onCreateDriverListener = function(cb,filter){
  filter = filter || function(){return true;};
  return function(driver){
    if(cb && filter(driver)){
      var _send = driver.send.bind(driver);
      driver.send = function(){
        var initialTime = new Date().getTime();
        return _send.apply(this,Array.prototype.slice.call(arguments)).then(function(result){
          callCbDriver(null,result,cb,initialTime,driver);
          return result;
        }).catch(function(err){
          callCbDriver(err,null,cb,initialTime,driver);
          throw err;
        });
      };
    }
  };
};
module.exports = function(userOpt){
  return function(opt){
    var actor = userOpt.actor || {};
    var driver = userOpt.driver || {};
    opt.listenTo.onCreateActor(onCreateActorListener(actor.callback,actor.filter));
    opt.listenTo.onCreateDriver(onCreateDriverListener(driver.callback,driver.filter));
  };
};
