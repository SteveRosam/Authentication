const https = require('https');

const token = process.env.QUIX_TOKEN
const apiUrl = "writer-quixdev-stevesstuff.dev.quix.ai"
const eventEndpoint = "/topics/__topic__/streams/__stream__/events/data"
const parameterEndpoint = "/topics/__topic__/streams/__stream__/parameters/data"

const topicPlaceholder = "__topic__"
const streamPlaceholder = "__stream__"

const topic = "app-data"
const telemetryTopic = "api-telemetry"


const publishEvent = async (id, value, userId) => {

    // 1 stream per user.. so use userid or email
    const path = eventEndpoint.replace(topicPlaceholder, topic).replace(streamPlaceholder, userId)

    const data = JSON.stringify([{
        "id": id,
        "timestamp": Date.now() * 1000,
        "value": value
    }]);

    const options = {
        hostname: apiUrl,
        path: path,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
      
        res.on('data', (d) => {
          console.log(d)
        });
    });
    
    req.write(data);
    req.end();

}

const publishTelemetry = async (id, value, userId, unauthorized = false) => {

    // 1 stream per user.. so use userid or email
    const path = parameterEndpoint.replace(topicPlaceholder, topic).replace(streamPlaceholder, userId)

    var dic = {id: [value]};

    var vals = '{ "' + id + '": [ "' + value + '" ] }'

    const data = JSON.stringify(
            {
                "timestamps": [ Date.now() * 1000 ],
                "tagValues": { userId: [ userId ], authorized: [ unauthorized === true ? "false" : "true"]},
                "stringValues": JSON.parse(vals)
            })
    
    const options = {
        hostname: apiUrl,
        path: path,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
      
        res.on('data', (d) => {
          console.log(d)
        });
    });
    
    console.log(data)
    console.log(options)

    req.write(data);
    req.end();

}

module.exports = {
    publishEvent,
    publishTelemetry
}