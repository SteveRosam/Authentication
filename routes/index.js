const express = require('express')
const router = express.Router()

router.get('/', function (_req, res) {
	res.send('Hello Express!! 👋')
})

router.get('/reset-password/:id/:token', function (req, res) {

	const { id, token } = req.params

	res.send(`<html>${id}<br/>${token}<form action="/auth/reset-password/${id}/${token}" method="post"><label>New Password</label><input type="text" name="password" id="password"></input>  <input type="submit" value="Submit">
	</form></html>`)
})

module.exports = router
