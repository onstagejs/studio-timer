buildTimerObj = (start,err)->
  end = new Date().getTime()
  {duration:end-start, error:err}
sendProxy = (timerId)->
  (send)->
    (sender,receiver,message,headers)->
      start = new Date().getTime()
      if timerId !=receiver
        send(sender,receiver,message,headers).then((res)->
          send('studio-timer',timerId,buildTimerObj(start),{sender:sender,receiver:receiver})
          res
        ).catch((err)->
          end = new Date().getTime()
          send('studio-timer',timerId,buildTimerObj(start,err),{sender:sender,receiver:receiver})
          throw err
        )
      else
        send(sender,receiver,message,headers)
module.exports = (timerId)->
  throw new Error('Undefined timer actor id') if not timerId
  (opt, Studio)->
    opt.interceptSend(sendProxy(timerId))
