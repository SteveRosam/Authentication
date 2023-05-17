const { verify } = require('jsonwebtoken')
//const Nedb = require('nedb-promises-ts')
//const authDb = new Nedb.Datastore({filename: "auth.db", autoload: true})
const quixHelpers = require("../utils/publishHelpers");
const userChecker = require("./userCheck")

const db_layer = require('../data_layer/data_layer')
const auth_database = db_layer.getAuthDb('nedb')
auth_database.init()

const protected = async (req, res, next) => {
	const authorization = req.headers['authorization']

	if (!authorization)
		return res.status(500).json({
			message: 'No token! 🤔',
			type: 'error',
		})
		
	console.log("authorization", authorization)

	const token = authorization.split(' ')[1]
	console.log("token", token)
	let id
	try {
		id = verify(token, process.env.ACCESS_TOKEN_SECRET).id
	} catch {
				
		await quixHelpers.publishTelemetry("route-protection", "auth-error", {
			error: "Invalid token",
			token: token
		});

		return res.status(500).json({
			message: 'Invalid token! 🤔',
			type: 'error',
		})
	}

	if (!id)
		return res.status(500).json({
			message: 'Invalid token! 🤔',
			type: 'error',
		})

	const user = await auth_database.findById(id)

	if (!user)
		return res.status(500).json({
			message: "User doesn't exist! 😢",
			type: 'error',
		})

	req.user = user
	next()
}

module.exports = { protected }
