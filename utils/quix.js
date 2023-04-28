const https = require("https");

const token = process.env.QUIX_TOKEN;
const apiUrl = "writer-quixdev-stevesstuff.dev.quix.ai";
const eventEndpoint = "/topics/__topic__/streams/__stream__/events/data";
const parameterEndpoint =
  "/topics/__topic__/streams/__stream__/parameters/data";

const topicPlaceholder = "__topic__";
const streamPlaceholder = "__stream__";

const topic = "app-data";
const telemetryTopic = "api-telemetry";

class ParameterData {
  timestamps = [];
  stringValues = [];
  numericValues = [];

  constructor() {}

  timeNow() {
    return Date.now() * 1000;
  }

  addNewVal(key, value, valArr) {
    if (valArr[key] === undefined) {
      //valArr.push(key)

      valArr[key] = [];

      for (let i = 0; i < this.timestamps.length - 1; i++) {
        valArr[key].push(undefined);
      }

      valArr[key].push(value);
    } else {
      if (valArr[key][valArr[key].length - 1] !== undefined) {
        console.log("Numeric value already defined for " + key);
      } else {
        valArr[key][valArr[key].length - 1] = value;
      }
    }
  }

  addNumeric(name, val) {
    this.addNewVal(name, val, this.numericValues);
  }

  addString(name, val) {
    this.addNewVal(name, val, this.stringValues);
  }

  addTimestamp(ts) {
    // add ts and push padding to all columns
    this.timestamps.push(ts);
    Object.keys(this.stringValues).forEach((key, index) => {
      this.stringValues[key].push(undefined);
    });
    Object.keys(this.numericValues).forEach((key, index) => {
      this.numericValues[key].push(undefined);
    });
  }

  addParameter(key, value) {
    switch (typeof value) {
      case "number":
      case "bigint":
        this.addNumeric(key, value);
        break;
      case "boolean":
        value = String(value);
      case "string":
        this.addString(key, value);
        break;
      default:
        console.log("Type not supported");
    }
  }

  async publish(topic, stream) {
    let svList = {};
    Object.keys(this.stringValues).forEach((k, i) => {
      svList[k] = this.stringValues[k];
    });

    let nvList = {};
    Object.keys(this.numericValues).forEach((k, i) => {
      nvList[k] = this.numericValues[k];
    });

    let result = {
      timestamps: this.timestamps,
      stringValues: svList,
      numericValues: nvList,
    };
    // console.log(result);

    this.timestamps = [];
    this.numericValues = [];
    this.stringValues = [];

    const payload = JSON.stringify(result);
    console.log(payload);
    await publishTelemetryJson(topic, stream, payload);
  }
}

const publishEvent = async (id, value, userId) => {
  // 1 stream per user.. so use userid or email
  const path = eventEndpoint
    .replace(topicPlaceholder, topic)
    .replace(streamPlaceholder, userId);

  const data = JSON.stringify([
    {
      id: id,
      timestamp: Date.now() * 1000,
      value: value,
    },
  ]);

  const options = {
    hostname: apiUrl,
    path: path,
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    console.log("statusCode:", res.statusCode);
    console.log("headers:", res.headers);

    res.on("data", (d) => {
      console.log(d);
    });
  });

  req.write(data);
  req.end();
};

const publishTelemetryJson = async (topic, stream, data) => {
  // 1 stream per user.. so use userid or email
  const path = parameterEndpoint
    .replace(topicPlaceholder, topic)
    .replace(streamPlaceholder, stream);

  const options = {
    hostname: apiUrl,
    path: path,
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    // console.log("statusCode:", res.statusCode);
    // console.log("headers:", res.headers);

    res.on("data", (d) => {
    //   console.log(d);
        let a = ""
    });
  });

//   console.log(data);
//   console.log(options);

  req.on("error", function (err) {
    // Handle error
    console.log(err);
    
  });

  req.write(data);
  req.end();
};

const publishTelemetry = async (id, value, userId, unauthorized = false) => {
  // 1 stream per user.. so use userid or email
  const path = parameterEndpoint
    .replace(topicPlaceholder, topic)
    .replace(streamPlaceholder, userId);

  var dic = { id: [value] };

  var vals = '{ "' + id + '": [ "' + value + '" ] }';

  const data = JSON.stringify({
    timestamps: [Date.now() * 1000, Date.now() * 1001],
    tagValues: {
      userId: [userId],
      authorized: [unauthorized === true ? "false" : "true"],
    },
    stringValues: JSON.parse(vals),
    numericValues: { myNum: [0, 1] },
  });

  const options = {
    hostname: apiUrl,
    path: path,
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    // console.log("statusCode:", res.statusCode);
    // console.log("headers:", res.headers);

    res.on("data", (d) => {
      console.log(d);
    });
  });

//   console.log(data);
//   console.log(options);

  req.write(data);
  req.end();
};

module.exports = {
  ParameterData,
};
