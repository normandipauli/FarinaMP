const jwt = require('jsonwebtoken');

module.exports = {
    isLoggedIn: (req, res, next) => {
        try {
        // const token = req.headers.authorization.split(' ')[1];
        const token = req.headers.authorization;
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );
        req.userData = decoded;
        next();
        } catch (err) {
        return res.status(401).send({
            msg: 'Su sessión en la aplicación ha expirado!.'
        });
        }
    }
};
