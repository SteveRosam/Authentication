const express = require('express')
const quix = require('../utils/quix')

const router = express.Router()
const { protected } = require('../utils/protected')

router.post('/publish', protected, async (req, res) => {
	try {

		if (req.user){
            await quix.publishTelemetry("route_access", "publish", req.user._id)
            await quix.publishEvent("test", "testVal", req.user._id)
        
            return res.json({
				message: 'Data published',
				type: 'success',
				user: req.user,
			})
        }

        // should never hit this!
        await quix.publishTelemetry("route_access", "publish", "unauthorized", false)

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

//TODO how to get app token to device
router.post('/get-app-token', protected, async (req, res) => {
	try {

		if (req.user){
            await quix.publishTelemetry("route_access", "get-app-token", req.user._id)
        
            return res.json({
				message: 'Data published',
				type: 'success',
				user: req.user,
			})
        }

        // should never hit this!
        await quix.publishTelemetry("route_access", "publish", "unauthorized", false)

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
