module.exports = function(Studio){
  var router = Studio.router;
  var _send = router.send;
  router.send = function(){
    var initialTime = new Date().getTime();
    return _send.apply(router,[].slice.call(arguments, 0)).then(function(result){
      var finalTime = new Date().getTime();
      console.log(finalTime - initialTime);
      return result;
    });
  }
};
