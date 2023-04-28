const quixHelpers = require("../utils/publishHelpers");

const routeLogger = async (req, res, next) => {
    try {
        const userId = undefined;
        if (req.user) {
            userId = req.user._id;
        }
        
        quixHelpers.publishTelemetry("routing", "route", {
            route: req.originalUrl,
            userId: userId,
            message: "here"
        });

        next();
    } catch (e) {
        console.log("Route logging error:" + e);
        // don't let errors block the rest of the system
        next();
    }
};

module.exports = { routeLogger };
