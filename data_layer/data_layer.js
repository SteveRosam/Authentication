const nedb = require('./nedb')
const mongodb = require('./mongodb')

const getAuthDb = (dbToUse = "mongo") => {
    //dbToUse can be mongo or nedb
    if(dbToUse === "nedb"){
        return new nedb.ne_db()
    }
    if(dbToUse === "mongo"){
        return new mongodb.mongo_db()
    }
}

module.exports = {
    getAuthDb
}