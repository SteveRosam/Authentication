const quixHelpers = require('../utils/publishHelpers')

let lastAccessTime = 0;

const rateLimiter = async (req, res, next) => {
  let isLimited = false;
  try {

    if (req.socket.remoteAddress != "::1") {
      console.log("NOT LOCAL");
    }

    let timeNow = new Date();

    if (lastAccessTime == 0) {
      lastAccessTime = new Date();
      console.log(lastAccessTime);
      next();
      return;
    }

    let diff = Math.abs(timeNow - lastAccessTime);
    console.log(diff);
    console.log(diff < 4000);
    lastAccessTime = new Date();

    if (diff < 2000) {
      // res.status(500).json({
      //   type: "error",
      //   message: "Rate limit exceeded!",
      // });
      console.log("This would have been rate limited!");
      isLimited = true;
      next(); //remove when implementing rate limiting
    } else {
      next();
    }
  } catch (e) {
    console.log("Rate limit error:" + e);
  } finally {
    quixHelpers.publishRateTelemetry({
      remoteAddress: req.socket.remoteAddress, 
      route: req.originalUrl, 
      isLimited: isLimited});
  }
};

module.exports = { rateLimiter };
