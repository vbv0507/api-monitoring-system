const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {

    try {

        let token;

        // CHECK TOKEN
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {

            token = req.headers.authorization.split(' ')[1];

            // VERIFY TOKEN
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // FIND USER
            req.user = await User.findById(decoded.id).select('-pass');

            next();

        } else {

            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });

        }

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

    }

}

module.exports = protect;   