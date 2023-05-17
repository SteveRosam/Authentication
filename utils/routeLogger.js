const quixHelpers = require("../utils/publishHelpers");
const userChecker = require("./userCheck")

const routeLogger = async (req, res, next) => {
    try {

        const user = await userChecker.userCheck(req);

        userId = undefined;
        if (user) {
            userId = user._id;
        }
        await quixHelpers.publishTelemetry("routing", "route", {
            route: req.originalUrl,
            userId: userId,
            ipAddress: req.ip
        });

        next();
    } catch (e) {
        console.log("Route logging error:" + e);
        // don't let errors block the rest of the system
        next();
    }
};

module.exports = { routeLogger };
