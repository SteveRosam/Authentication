const quix = require('../utils/quix')

async function test() {
	let data = new quix.ParameterData();

    data.addTimestamp(data.timeNow())
    data.addParameter("A", 1)
    data.addParameter("A", 2)
    data.addParameter("A", "one")
    data.addParameter("B", 1)
    data.addParameter("A", 3)
    data.addParameter("C", "one")
    data.addTimestamp(data.timeNow())
    data.addParameter("A", 1)
    data.addParameter("A", 2)
    data.addParameter("B", 1)
    data.addParameter("C", 3)
    data.addParameter("A", "two")
    data.addParameter("A", "three")
    data.addParameter("C", "two")

    data.addTimestamp(data.timeNow())
    data.addParameter("F", 1)
    data.addParameter("G", "one")
    
	await data.publish("rate", "rate")

    let count = 0
    let interval = setInterval(async function () {

        count++
        if(count > 100) 
            clearInterval(interval)

        data.addTimestamp(data.timeNow())
        data.addParameter("counter", count)
        data.addParameter("G", "one" + count)
	    await data.publish("rate", "rate")

    }, 1000);
}

async function publishRateTelemetry(args) {
	let data = new quix.ParameterData();

    data.addTimestamp(data.timeNow())
	if(args.remoteAddress)
        data.addParameter("remoteAddress", args.remoteAddress)
    if(args.message)
        data.addParameter("message", args.message)
    if(args.route)
        data.addParameter("route", args.route)
    if(args.userId)
        data.addParameter("userId", userId)
    if(args.isLimited !== undefined)
        data.addParameter("isLimited", args.isLimited)    

    await data.publish("rate", "rate")
}

async function publishTelemetry(topic, stream, args) {
	let data = new quix.ParameterData();
    data.addTimestamp(data.timeNow())

    if(!stream){
        throw "stream is required"
    }
    if(!topic){
        throw "topic is required"
    }
    if(args.message){
        data.addParameter("message", args.message)
    }
    if(args.route){
        data.addParameter("route", args.route)
    }
    if(args.userId){
        data.addParameter("userId", userId)
    }

        
	await data.publish(topic, stream)
}

async function publishErrorTelemetry(args) {
	let data = new quix.ParameterData();
    data.addTimestamp(data.timeNow())
    if(args.message)
        data.addParameter("message", args.message)
    if(args.route)
        data.addParameter("route", args.route)

	await data.publish("error", "error")
}

module.exports = {
    publishTelemetry,
    publishErrorTelemetry,
    publishRateTelemetry,
    test
}