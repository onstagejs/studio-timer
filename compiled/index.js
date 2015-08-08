(function() {
  var buildTimerObj, sendProxy;

  buildTimerObj = function(start, err) {
    var end;
    end = new Date().getTime();
    return {
      duration: end - start,
      error: err
    };
  };

  sendProxy = function(timerId) {
    return function(send) {
      return function(sender, receiver, message, headers) {
        var start;
        start = new Date().getTime();
        if (timerId !== receiver) {
          return send(sender, receiver, message, headers).then(function(res) {
            send('studio-timer', timerId, buildTimerObj(start), {
              sender: sender,
              receiver: receiver
            });
            return res;
          })["catch"](function(err) {
            var end;
            end = new Date().getTime();
            send('studio-timer', timerId, buildTimerObj(start, err), {
              sender: sender,
              receiver: receiver
            });
            throw err;
          });
        } else {
          return send(sender, receiver, message, headers);
        }
      };
    };
  };

  module.exports = function(timerId) {
    if (!timerId) {
      throw new Error('Undefined timer actor id');
    }
    return function(opt, Studio) {
      return opt.interceptSend(sendProxy(timerId));
    };
  };

}).call(this);

//# sourceMappingURL=maps/index.js.map
