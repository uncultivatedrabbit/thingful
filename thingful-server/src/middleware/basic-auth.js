// created new folder MIDDLEWARE and a new file
// called basic-auth to handle validating basic auth
// on server

function requireAuth(req, res, next) {
  // get auth token
  const authToken = req.get("Authorization") || "";
  let basicToken;
  // verify the auth token contains correct format values
  if (!authToken.toLowerCase().startsWith("basic ")) {
    return res.status(401).json({ error: "Missing basic token" });
  } else {
    // save the basic token from the authToken
    basicToken = authToken.slice("basic ".length, authToken.length);
  }

  // pull tokenUsername and password from basicToken
  const [tokenUserName, tokenPassword] = Buffer.from(basicToken, "base64")
    .toString()
    .split(":");

  // if the username or password don't exist throw an error
  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: "Unauthorized request 1" });
  }
  // select user from DB with username matches
  req.app
    .get("db")("thingful_users")
    .where({ user_name: tokenUserName })
    .first()
    .then((user) => {
      if (!user || user.password !== tokenPassword) {
        return res.status(401).json({ error: "Unauthorized request 2" });
      }
      // user passed as request user
      req.user = user;
      next();
    })
    .catch(next);
}

module.exports = {
  requireAuth,
};
