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
    
    addNull(name, targetArray) {

        let found = targetArray.findIndex(s => s == name)

        if(found === -1){
            targetArray.push(name)
            targetArray[name] = [null]
        }else{
            targetArray[name].push(null)
        }
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
  
  addNum(name, val, ts){
    let valArr = this.numericValues;
    this.addVal(name, val, valArr);
    this.addNull(name, this.stringValues)
    this.addNull(name, this.binaryValues)
    this.timestamps.push(ts)
  }
  adStr(name, val, ts){
    let valArr = this.stringValues;
    this.addVal(name, val, valArr);
    this.addNull(name, this.numericValues)
    this.addNull(name, this.binaryValues)
    this.timestamps.push(ts)
  }
  adBin(name, val, ts){
    let valArr = this.binaryValues;
    this.addVal(name, val, valArr);
    this.addNull(name, this.stringValues)
    this.addNull(name, this.numericValues)
    this.timestamps.push(ts)
  }

  addValue(ts, name, val) {
    switch (typeof val) {
      case "number":
      case "bigint":
        this.addNum(name, val, ts);
        break;
      case "boolean":
        val = String(val)
      case "string":
        this.adStr(name, val, ts);
        break;
      default:
        console.log("Type not supported")
    }
  }

  getJson(){
    let svList = {}
    this.stringValues.forEach((a,b)=>{
        svList[a] = this.stringValues[a]
    });
    let nvList = {}
    this.numericValues.forEach((a,b)=>{
        nvList[a] = this.numericValues[a]
    });

    let result = {
        timestamps: this.timestamps,
        stringValues: svList,
        numericValues: nvList
    }
    console.log(result)
    console.log(JSON.stringify(result))
  }
}
let td = new TelemetryData();

ts = Date.now() * 1000
td.addValue(ts, "name-1", "sVal-1");
td.addValue(ts, "name-1", "sVal-2");
td.addValue(ts, "name-1", true);
td.addValue(ts, "name-1", 1000);
td.addValue(Date.now() * 1001, "name-1", "1005");
td.addValue(Date.now() * 2000, "name-1", "1010");

td.addValue(ts, "name-2", "n2-v1");

td.addValue(ts, "name-3", true);
td.addValue(ts, "name-3", true);
td.addValue(ts, "name-3", 2000);

td.getJson();
// td.addOne(Date.now() * 1000, "name-1", 1);

