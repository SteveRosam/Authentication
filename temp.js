let data = {
  password: "jkljkl",
};

let d2 = { password: "jkljkl" };
console.log(d2.password);

if (data.xx === undefined) {
  console.log("XX");
}

let p1 = data.password;

let p = data["password"];

class TelemetryData {
    timestamps = [];
    stringValues = [];
    numericValues = [];
    binaryValues = [];

  constructor() {}

    addNullNumeric(name) {

        let found = this.numericValues.findIndex(s => s == name)

        if(found === -1){
            this.numericValues.push(name)
            this.numericValues[name] = [null]
        }else{
            this.numericValues[name].push(null)
        }
    }

    addNullString(name) {

        let found = this.stringValues.findIndex(s => s == name)

        if(found === -1){
            this.stringValues.push(name)
            this.stringValues[name] = [null]
        }else{
            this.stringValues[name].push(null)
        }
    }

    addNull(name, targetArray) {

        let found = targetArray.findIndex(s => s == name)

        if(found === -1){
            targetArray.push(name)
            targetArray[name] = [null]
        }else{
            targetArray[name].push(null)
        }
    }

    addNullBinary(name) {
        // if(this.binaryValues.length === 0){
        //     this.binaryValues.push(name)
        //     this.binaryValues[name] = [null]
        // }else{
        //     //this.binaryValues[name].push(null)
        // }
    }

  setTimestamps(timestamps) {
    this.timestamps = timestamps;
  }
  addStringValue(name, value) {
    if (this.stringValues[name] === undefined) {
      this.stringValues[name] = [value];
    } else {
      this.stringValues[name].push(value);
    }
  }

  addString(name, val){
    let sv = this.stringValues.find(s => s == name)
    if(sv === undefined) {
        this.stringValues.push(name)
        this.stringValues[name] = []

        // pad this new array
        this.timestamps.forEach((value, index) => {
            this.stringValues[name].push(null)
        });
    }   
    this.stringValues[name].push(val)

    //find all the ones that arent this name and pad with a null
    this.stringValues.filter(f=> f !== name).forEach((value, index) => {
        this.addNullString(value);
    });

    this.addNullNumeric(name);
    this.addNullBinary(name);

    this.timestamps.push(ts)
  }

  addVal(name, val, valArr){
    let sv = valArr.find(s => s == name)
    if(sv === undefined) {
        valArr.push(name)
        valArr[name] = []

        // pad this new array
        this.timestamps.forEach((value, index) => {
            valArr[name].push(null)
        });
    }   
    valArr[name].push(val)

    //find all the ones that arent this name and pad with a null
    valArr.filter(f=> f !== name).forEach((value, index) => {
        this.addNull(value, valArr);
    });
  }
  
  addNum(name, val){
    let valArr = this.numericValues;
    this.addVal(name, val, valArr);
    this.addNull(name, this.stringValues)
    this.addNull(name, this.binaryValues)
    this.timestamps.push(ts)
  }
  adStr(name, val){
    let valArr = this.stringValues;
    this.addVal(name, val, valArr);
    this.addNull(name, this.numericValues)
    this.addNull(name, this.binaryValues)
    this.timestamps.push(ts)
  }
  adBin(name, val){
    let valArr = this.binaryValues;
    this.addVal(name, val, valArr);
    this.addNull(name, this.stringValues)
    this.addNull(name, this.numericValues)
    this.timestamps.push(ts)
  }


  addOne(ts, name, val) {
    //get type and add accordingly....

    switch (typeof val) {
      case "number":
      case "bigint":
        this.addNum(name, val);

        break;
      case "boolean":
        val = String(val)
      case "string":

        this.adStr(name, val);

      // let sv = this.stringValues.find(s => s == name)
        // if(sv === undefined) {
        //     this.stringValues.push(name)
        //     this.stringValues[name] = []

        //     // pad this new array
        //     this.timestamps.forEach((value, index) => {
        //         this.stringValues[name].push(null)
        //     });

        // }   
        // this.stringValues[name].push(val)

        // //find all the ones that arent this name and pad with a null
        // this.stringValues.filter(f=> f !== name).forEach((value, index) => {
        //     this.addNullString(value);
        // });

        // this.addNullNumeric(name);
        // this.addNullBinary(name);

        // this.timestamps.push(ts)

        

        // if (this.timestamps[ts] === undefined) {
        //     this.timestamps.push(ts);
        // }else{
        //     let tsFoundAt = this.timestamps.find(ts)
        // }
        break;
      default:
        console.log("Type not supported")
    }

    console.log("------------------------------")
    console.log(this.timestamps)
    console.log(this.stringValues)
    console.log(this.numericValues)
    console.log(this.binaryValues)

    let r = {
        timestamps: this.timestamps,
        stringValues: this.stringValues,
        numericValues: this.numericValues,
        binaryValues: this.binaryValues
    }
    console.log(JSON.stringify(r))

    let svList = {}
    this.stringValues.forEach((a,b)=>{
        let j = JSON.stringify(this.stringValues[a])
        
        svList[a] = this.stringValues[a]
        
    })

    let s1 = JSON.stringify(this.timestamps)
    let s2 = JSON.stringify(this.stringValues)


    let result = {
        timestamps: this.timestamps,
        stringValues: svList
    }
    console.log(result)
  }
}
let td = new TelemetryData();
// td.setTimestamps([Date.now() * 1000]);
// td.addStringValue("parameterName", "paramValue");
// td.addStringValue("parameterName", "paramValue2");
ts = Date.now() * 1000
td.addOne(ts, "name-1", "sVal-1");
td.addOne(ts, "name-1", "sVal-2");
td.addOne(ts, "name-1", true);
td.addOne(ts, "name-1", 1000);

td.addOne(ts, "name-2", "n2-v1");

td.addOne(ts, "name-3", true);
td.addOne(ts, "name-3", true);
td.addOne(ts, "name-3", 2000);

// td.addOne(Date.now() * 1000, "name-1", 1);

