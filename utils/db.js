//const Datastore = require('nedb')
const Nedb = require('nedb-promises-ts')

var Person = function () {
    this._name;
};

const auth = new Nedb.Datastore({filename: "xx.db", autoload: true})
//const collection = new Nedb<Person>({autoload: true});


//const auth = new Datastore({ filename: 'dataFile.db', autoload: true })

auth.loadDatabase(function (err) {    // Callback is optional
  // Now commands will be executed
  if(err !== null){
  	console.log("Error is: " + err)
  }
  else{
	console.log("DB Loaded!")
  }
});

// db.insert({hello: "world", function(err, newDoc){
// 	console.log("New Doc")
// }})

// db.remove({ hello: 'world' }, { multi: true }, function (err, numRemoved) {
// 	// numRemoved = 3
// 	// All planets from the solar system were removed
// 	console.log("Removed " + numRemoved + " docs")
//   });


// db.find({ hello: 'world' }, function (err, docs) {
// 	// docs is an array containing documents Mars, Earth, Jupiter
// 	// If no document is found, docs is equal to []
// 	console.log(docs)
//   });

module.exports = {
    auth,
    findOne
}
