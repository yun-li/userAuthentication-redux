const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config/config');

function tokenUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode(
		{
		sub: user.id, 
		iat: timestamp 
		}, config.secret );
	// jwt.encode({ [info to encode] }, config.[secret to encrypt with] );
	// (subject) property 'sub': what is token for?
	// (Issued At Time) 'iat': timestamp
}

exports.signup = function(req, res, next) {

	console.log(req.body);
	const email = req.body.email;
	const password = req.body.password;

	if (!email || !password) {
		return res.status(422).send({ error: 'Please provide both an email and password.'});
	}
	// Verify: email is unique in database
	// Search for email--> Invoke a Callback to be passed (err, existingUser) 
	User.findOne({ email: email }, function(err, existingUser) {
		if  (err) {
			return next(err);
		}

		// Action (-): If DUPLICATE exists, RETURN ERROR
		if (existingUser) {
			return res.status(422).send({ error: 'Email is in use' });
			// ^ (Error 422: Unprocessable Request)
		}

		// Action (+): If UNIQUE email entry, CREATE & SAVE new user record
		
		// *ONLY CREATING User (not saved yet)
		const user = new User({
			email: email,
			password: password
		});

		// *Now SAVING User to database
		user.save(function(err) {
			if (err) {
				return next(err);
			}
		// Response--> Request: Confirm User Created
		res.json({ token: tokenUser(user) });
		});

	});

}