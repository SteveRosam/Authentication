const Nedb = require('nedb-promises-ts')
const authDb = new Nedb.Datastore({filename: "auth.db", autoload: true})

class ne_db {
    constructor() {}
 
    async init () {}

    async findById(id) {
        return await authDb.findOne({_id: id})
    }

    async findByEmail(email) {
        return await authDb.findOne({email: email})
    }

    async insert(row){
        await authDb.insert(row)
    }

    async updatePassword(id, password){
        const user = await this.findByEmail(email)
        user.password = password
		await authDb.update({_id: id}, user)
    }

    async updateRefreshToken(email, refreshToken){
        const user = await this.findByEmail(email)
        user.refreshtoken = refreshToken
		await authDb.update({email: email}, user)
    }


}


module.exports = {
    ne_db
}