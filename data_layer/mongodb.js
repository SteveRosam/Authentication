const { MongoClient } = require("mongodb");
var ObjectId = require('mongodb').ObjectId; 

class mongo_db {
    client = null;
    database = null;
    collection = null;

    constructor() {
        this.client = new MongoClient(process.env.MONGO_URI);
    }
    
    async init () {
        await this.client.connect();
        this.database = this.client.db("app");
        this.collection = this.database.collection("auth");

    }

    async findById(id) {
        const query = {_id: ObjectId(`${id}`)}
        return await this.collection.findOne(query)
    }

    async findByEmail(email) {
        return await this.collection.findOne({email: email})
    }
    
    async insert(row){
        await this.collection.insert(row)
    }
    
    async updatePassword(id, password){
        await this.updateOne({_id: ObjectId(`${id}`)}, {"$set": {password: password}})
    }

    async updateRefreshToken(email, refreshToken){
        await this.collection.updateOne({"email": email}, {"$set": {refreshtoken: refreshToken}})
    }

}

module.exports = {
    mongo_db
}