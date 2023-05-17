const { verify } = require('jsonwebtoken')

const db_layer = require('../data_layer/data_layer')
const auth_database = db_layer.getAuthDb('nedb')
auth_database.init()

const getUser = async (token, secret) => {
	let id
	try {
		id = verify(token, secret).id
	} catch {
		return undefined
	}

	if (!id)
		return undefined

	const user = await auth_database.findById(id)

	if (user)
		return user
}

const userCheck = async (req) => {
	const authorization = req.headers['authorization']
	
	if (authorization){
		const token = authorization.split(' ')[1]
		return getUser(token, process.env.ACCESS_TOKEN_SECRET)
	} 
	return undefined
}

module.exports = { userCheck }
