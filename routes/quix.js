const express = require('express')
const routeHelpers = require('../utils/publishHelpers')

const router = express.Router()
const { protected } = require('../utils/protected')

router.post('/publish', protected, async (req, res) => {
	try {

		if (req.user){

			await routeHelpers.publishTelemetry(
				route = req.originalUrl,
				userId = req.user._id);

            return res.json({
				message: 'Data published',
				type: 'success',
				user: req.user,
			})
        }

        // should never hit this!
		await routeHelpers.publishErrorTelemetry(
			"Unauthorized access to route", 
			route = req.originalUrl);

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

module.exports = router
