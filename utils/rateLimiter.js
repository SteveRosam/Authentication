let lastAccessTime = 0;
let accessCount = 0;

const rateLimiter = async (req, res, next) => {
  try {
    //console.log(req)
    console.log(req.ip);
    console.log(req.socket.remoteAddress);

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
      console.log("This would have been rate limited!")
      next();
    } else {
      next();
    }
  } catch (e) {
    console.log("Rate limit error:" + e);
  }
};

module.exports = { rateLimiter };
