const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verify } = require('jsonwebtoken')
const quixHelpers = require("../utils/publishHelpers");
//const userChecker = require("./userCheck")

const db_layer = require('../data_layer/data_layer')
const auth_database = db_layer.getAuthDb('nedb')
auth_database.init()

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
		// console.log('Body: ', req.body)
		// console.log('email: ', email)

		await quixHelpers.publishTelemetry("auth", "signup", {
            email: email
        });

		const user = await auth_database.findByEmail(email)
		if (user !== null){
			await quixHelpers.publishTelemetry("auth", "signup-error", {
				email: email,
				error: "already_exists"
			});

			return res.status(500).json({
				message: 'User already exists! Try logging in. 😄',
				type: 'warning',
			})
		}
		const passwordHash = await hash(password, 10)
		const newUser = {
			email: email,
			password: passwordHash,
		}

		await auth_database.insert(newUser)

		res.status(200).json({
			message: 'User created successfully! 🥳',
			type: 'success',
		})
	} catch (error) {
		console.log('Error: ', error)
		
		await quixHelpers.publishTelemetry("auth", "signup-error", {
			email: email,
			error: "signup-failed",
			message: error.message
		});

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

		await quixHelpers.publishTelemetry("auth", "signin", {
            email: email
        });

		const user = await auth_database.findByEmail(email)

		if (user === null)
		{	
			await quixHelpers.publishTelemetry("auth", "signin-error", {
				email: email,
				error: "user_does_not_exist"
			});
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})
		}

		const isMatch = await compare(password, user.password)
		if (!isMatch)
		{
			await quixHelpers.publishTelemetry("auth", "signin-error", {
				email: email,
				error: "password_incorrect"
			});
			return res.status(500).json({
				message: 'Password is incorrect! ⚠️',
				type: 'error',
			})
		}
		const accessToken = createAccessToken(user._id)
		const refreshToken = createRefreshToken(user._id)

		await auth_database.updateRefreshToken(email, refreshToken)

		sendRefreshToken(res, refreshToken)
		sendAccessToken(req, res, accessToken)
	} catch (error) {
		console.log('Error: ', error)
				
		await quixHelpers.publishTelemetry("auth", "signin-error", {
			email: email,
			error: error.message
		});

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
			
			await quixHelpers.publishTelemetry("auth", "token-refresh-error", {
				error: "invalid-refresh-token",
				error_code: "TOKEN_VERIFICATION_ERROR"
			});
			
			return res.status(500).json({
				message: 'Invalid refresh token! 🤔',
				type: 'error',
			})
		}

		if (!id)
		{
			await quixHelpers.publishTelemetry("auth", "token-refresh-error", {
				token: refreshToken,
				error: "invalid-refresh-token",
				error_code: "NULL_ID"
			});

			return res.status(500).json({
				message: 'Invalid refresh token! 🤔',
				type: 'error',
			})
		}

		const user = await auth_database.findById(id)

		if (!user)
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})

		if (user.refreshtoken !== refreshtoken){
				
			await quixHelpers.publishTelemetry("auth", "token-refresh-error", {
				error: "token-refresh-failed",
				message: error
			});
			return res.status(500).json({
				message: 'Invalid refresh token! 🤔',
				type: 'error',
			})
		}
			

		const accessToken = createAccessToken(user._id)
		const refreshToken = createRefreshToken(user._id)

		await auth_database.updateRefreshToken(user.email, refreshToken)

		sendRefreshToken(res, refreshToken)
		return res.json({
			message: 'Refreshed successfully! 🤗',
			type: 'success',
			accessToken,
		})
	} catch (error) {
		console.log('Error: ', error)	

		await quixHelpers.publishTelemetry("auth", "token-refresh-error", {
			error: "token-refresh-failed",
			message: error
		});

		res.status(500).json({
			type: 'error',
			message: 'Error refreshing token!',
			error,
		})
	}
})

// example of using a protected route
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
		
		await quixHelpers.publishTelemetry("auth", "protected", {
			error: "protected-route-failed",
			message: error.message
		});
		
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

		const user = await auth_database.findByEmail(email)
		if (!user){

			quixHelpers.publishTelemetry("auth", "send-reset-email", {
				error: "user-not-found"
			});
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})
		}
		const token = createPasswordResetToken(user)
		const url = createPasswordResetUrl(user._id, token)

		const mailOptions = passwordResetTemplate(user, url)
		transporter.sendMail(mailOptions, (err, info) => {
			console.log(err, info)
			if (err){
				console.log(err)
				quixHelpers.publishTelemetry("auth", "send-reset-email", {
					error: "error-sending-reset-mail",
					message: err
				});

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
		
		await quixHelpers.publishTelemetry("auth", "send-reset-email", {
			error: "send-reset-email-failed",
			message: error.message
		});
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
			
			await quixHelpers.publishTelemetry("auth", "reset-password", {
				error: "no-password"
			});
			res.status(500).json({
				type: 'error',
				message: 'newPassword is not defined',
			})
		}

		const user = await auth_database.findById(id)

		if (!user){
			await quixHelpers.publishTelemetry("auth", "reset-password", {
				error: "user-not-found"
			});
			return res.status(500).json({
				message: "User doesn't exist! 😢",
				type: 'error',
			})
		}
		const isValid = verify(token, user.password)

		if (!isValid)
		{
			await quixHelpers.publishTelemetry("auth", "reset-password", {
				error: "invald-token"
			});
		
			return res.status(500).json({
				message: 'Invalid token! 😢',
				type: 'error',
			})
		}

		const password = await hash(newPassword, 10)

		await auth_database.updatePassword(id, password)

		const mailOptions = passwordResetConfirmationTemplate(user)
		transporter.sendMail(mailOptions, (err, info) => {
			if (err){
						
				quixHelpers.publishTelemetry("auth", "reset-password", {
					error: "error-sending-mail",
					message: err
				});
			
				return res.status(500).json({
					message: 'Error sending email! 😢',
					type: 'error',
				})
			}
			return res.json({
				message: 'Email sent! 📧',
				type: 'success',
			})
		})
	} catch (error) {
		console.log('Error: ', error)

		await quixHelpers.publishTelemetry("auth", "reset-password", {
			error: "reset-password-failed",
			message: error.message
		});
		res.status(500).json({
			type: 'error',
			message: 'Error sending email!',
			error,
		})
	}
})

module.exports = router
