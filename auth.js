const jwt = require('jsonwebtoken');
const pseudoDatabase = './src/db.json';
const login = __dirname + '/src/html/login.html';


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'just a secret', (err, decodedToken) => {
            if(err) res.redirect('/login');
            req.user = decodedToken;
            next();
        })
        return;
    }
    res.sendFile(login)
}


// Check current user

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    const data = fs.readFileSync(pseudoDatabase);
    const db = JSON.parse(data);
    if(token){
        jwt.verify(token, 'just a secret', (err, decodedToken) => {
            if(err) {
                res.locals.user = null;
                next();
            }
            else {
                let name = db.users.filter(user => {
                    return user.name === decodedToken;
                })
                res.locals.user = name;
            }
        })
    }
    else {
        res.locals.user = null;
        next();
    }
}
module.exports = {requireAuth, checkUser};
