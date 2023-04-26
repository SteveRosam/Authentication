const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verify } = require('jsonwebtoken')

const Nedb = require('nedb-promises-ts')
const authDb = new Nedb.Datastore({filename: "auth.db", autoload: true})

const {
	createAccessToken,
	createRefreshToken,
	sendAccessToken,
	sendRefreshToken,
	createPasswordResetToken,
} = require('../utils/tokens')
const {
	transporter,
	createPasswordResetUrl,
	passwordResetTemplate,
	passwordResetConfirmationTemplate,
} = require('../utils/email')

const { protected } = require('../utils/protected')

/* GET main auth page. */
router.get('/', async (req, res) => {
	res.send('Hello Express!! 👋, this is Auth end point')
})

router.post('/signup', async (req, res) => {
	try {
		const { email, password } = req.body
		console.log('Body: ', req.body)
		console.log('email: ', email)
		
		//const user = await User.findOne({ email: email }) // for mongo
		const user = await authDb.findOne({ email: email })
		if (user !== null)
			return res.status(500).json({
				message: 'User already exists! Try logging in. 😄',
				type: 'warning',
			})

		const passwordHash = await hash(password, 10)
		const newUser = {
			email: email,
			password: passwordHash,
		}

		await authDb.insert(newUser)
		//await newUser.save() // for mongo

		res.status(200).json({
			message: 'User created successfully! 🥳',
			type: 'success',
		})
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({
			type: 'error',
			message: 'Error creating user!',
			error,
		})
	}
})

router.post('/signin', async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await authDb.findOne({ email: email })

		//const user = await User.findOne({ email: email }).select('+refreshtoken')
		if (user === null)
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})
		console.log(user)

		console.log(user.password)
		const isMatch = await compare(password, user.password)
		if (!isMatch)
			return res.status(500).json({
				message: 'Password is incorrect! ⚠️',
				type: 'error',
			})

		const accessToken = createAccessToken(user._id)
		const refreshToken = createRefreshToken(user._id)

		user.refreshtoken = refreshToken
		await authDb.update({email: email}, user)

		sendRefreshToken(res, refreshToken)
		sendAccessToken(req, res, accessToken)
	} catch (error) {
		console.log('Error: ', error)

		res.status(500).json({
			type: 'error',
			message: 'Error signing in!',
			error,
		})
	}
})

router.post('/logout', async (_req, res) => {

	// maybe clear some token in the db?
	//let usr = database.auth.insert({hi: "friends"})
	
	res.clearCookie('refreshtoken')
	return res.json({
		message: 'Logged out successfully! 🤗',
		type: 'success',
	})
})

router.post('/refresh_token', async (req, res) => {
	try {
		const { refreshtoken } = req.cookies
		if (!refreshtoken)
			return res.status(500).json({
				message: 'No refresh token! 🤔',
				type: 'error',
			})

		let id
		try {
			id = verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET).id
		} catch (error) {
			return res.status(500).json({
				message: 'Invalid refresh token! 🤔',
				type: 'error',
			})
		}

		if (!id)
			return res.status(500).json({
				message: 'Invalid refresh token! 🤔',
				type: 'error',
			})

		const user = await authDb.findOne({_id: id})

		if (!user)
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})

		if (user.refreshtoken !== refreshtoken)
			return res.status(500).json({
				message: 'Invalid refresh token! 🤔',
				type: 'error',
			})

		const accessToken = createAccessToken(user._id)
		const refreshToken = createRefreshToken(user._id)

		user.refreshtoken = refreshToken

		sendRefreshToken(res, refreshToken)
		return res.json({
			message: 'Refreshed successfully! 🤗',
			type: 'success',
			accessToken,
		})
	} catch (error) {
		console.log('Error: ', error)

		res.status(500).json({
			type: 'error',
			message: 'Error refreshing token!',
			error,
		})
	}
})

router.get('/protected', protected, async (req, res) => {
	try {
		if (req.user)
			return res.json({
				message: 'You are logged in! 🤗',
				type: 'success',
				user: req.user,
			})

		return res.status(500).json({
			message: 'You are not logged in! 😢',
			type: 'error',
		})
	} catch (error) {
		res.status(500).json({
			type: 'error',
			message: 'Error getting protected route!',
			error,
		})
	}
})

router.post('/send-password-reset-email', async (req, res) => {
	try {
		const { email } = req.body

		const user = await authDb.findOne({ email: email })
		if (!user)
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})
		const token = createPasswordResetToken(user)
		const url = createPasswordResetUrl(user._id, token)

		const mailOptions = passwordResetTemplate(user, url)
		transporter.sendMail(mailOptions, (err, info) => {
			console.log(err, info)
			if (err){
				console.log(err)
				return res.status(500).json({
					message: 'Error sending email! 😢',
					type: 'error',
					err: err
				})
			}
			return res.json({
				message: 'Password reset link has been sent to your email! 📧',
				type: 'success',
			})
		})
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({
			type: 'error',
			message: 'Error sending email!',
			error,
		})
	}
})

router.post('/reset-password/:id/:token', async (req, res) => {
	try {
		const { id, token } = req.params
		const { newPassword } = req.body
		
		if(newPassword === undefined){
			res.status(500).json({
				type: 'error',
				message: 'newPassword is not defined',
			})
		}

		console.log(`id=${id}`)
		console.log(`token=${token}`)

		const user = await authDb.findOne({_id: id})

		if (!user)
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})

		const isValid = verify(token, user.password)

		if (!isValid)
			return res.status(500).json({
				message: 'Invalid token! 😢',
				type: 'error',
			})

		user.password = await hash(newPassword, 10)

		await authDb.update({_id: id}, user)

		const mailOptions = passwordResetConfirmationTemplate(user)
		transporter.sendMail(mailOptions, (err, info) => {
			if (err)
				return res.status(500).json({
					message: 'Error sending email! 😢',
					type: 'error',
				})

			return res.json({
				message: 'Email sent! 📧',
				type: 'success',
			})
		})
	} catch (error) {
		console.log('Error: ', error)

		res.status(500).json({
			type: 'error',
			message: 'Error sending email!',
			error,
		})
	}
})

module.exports = router
