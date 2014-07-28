function validateRss(req, res, next) {
	if (req && req.query && req.query.id) {
		next();
	} else {
		res.send("Invalid query, missing activity list id");
	}
}
