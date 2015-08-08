# studio-timer
Timer plugin for node studio

This plugin calculates the time of the actor execution and then send the result to a given actor


Usage
======

```js
var Studio = require('studio');
var timer = require('./compiled');//('studio-timer');
Studio.use(timer('myLogTimerActor'));

new Studio.Actor({
  id:'myLogTimerActor',
  process:function(message){
    //In this example we just log, but we can send this result to a database, StatsD or any place
    console.log(message);
  }
});

var sender = new Studio.Actor({id:'sender',process:function(){}});
var receiver = new Studio.Actor({id:'receiver',process:function(){return 'Hello';}});
sender.send('receiver',{});
```

Remember since Studio uses Baconjs you can add throttle, buffer,skip or any
transformation for your actor who is going to log the time
