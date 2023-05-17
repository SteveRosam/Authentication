const express = require('express')
const quixHelpers = require("../utils/publishHelpers");

const router = express.Router()
const { protected } = require('../utils/protected')

router.post('/publish', protected, async (req, res) => {
	try {

		if (req.user){

			await quixHelpers.publishTelemetry("quix", "publish", {
					userId: userId
				});

            return res.json({
				message: 'Data published',
				type: 'success',
				user: req.user,
			})
        }

		await quixHelpers.publishTelemetry("quix", "publish-error", {
			userId: userId,
			message: "Unauthorized route access"
		});
        // should never hit this!
		await routeHelpers.publishErrorTelemetry(
			"Unauthorized access to route", 
			route = req.originalUrl);

		return res.status(500).json({
			message: 'You are not logged in! 😢',
			type: 'error',
		})

	} catch (error) {
		
		await quixHelpers.publishTelemetry("quix", "publish-error", {
			error: "publish-failed",
			message: error.message
		});
		res.status(500).json({
			type: 'error',
			message: 'Error getting protected route!',
			error,
		})
	}
})

module.exports = router
