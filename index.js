const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs'); 
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {requireAuth} = require('./auth');
const app = express();

const pseudoDatabase = './src/db.json';
const login = __dirname + '/src/html/login.html';
const register = __dirname + '/src/html/register.html';
const home = __dirname + '/src/html/homepage.html';
const port = 3000;

//middleware
app.use(express.static(__dirname + '/src'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());


const maxAge = 3 * 24 * 60 * 60;
const createToken = (name) => {
    return jwt.sign({name}, 'just a secret', {
        expiresIn: maxAge
    })
}

// app.get('*', checkUser);


app.get('/', requireAuth, (req, res) => {
    res.cookie('checkUser', false);
    if (req.user) res.redirect('/home');
    else res.sendFile(login);
});


//post req to handle login form submits
app.post('/login', async (req, res) => {
    function loginRedirect(){
        res.cookie('checkUser', true);
        res.sendFile(login);
    }
    
    let {name, password} = req.body;
    
    let data = fs.readFileSync(pseudoDatabase);
    let db = JSON.parse(data);

    let status = db.users.filter(user => {
        return user.name === name;
    })
    if(status.length > 0){
        let validation = await bcrypt.compare(password, status[0].password);
        if(validation){
            const token = createToken(name, password);
            res.cookie('jwt', token, {httpOnly: true, maxAge:1000*maxAge});
            res.redirect('/home');
            return;
        }
        loginRedirect();
    }
    else loginRedirect();
    

});

// post req after user submits registration form
// and redirects to login page
app.post('/register', async (req, res) => {
    let {name, email, password} = req.body;
    let user = req.body;
    let checkUser = req.cookies.userExists === 'false';

    let data = fs.readFileSync(pseudoDatabase);
    let db = JSON.parse(data);

    let status = db.users.filter((user) => {
        return user.name === name; 
    })

    if(status.length > 0){
        res.cookie('userExists', true);
        checkUser = false;
        res.sendFile(register)
    }
    else{
        checkUser = true;
    }

    let hashPassword = await bcrypt.hash(password, 10);
    let hashEmail = await bcrypt.hash(email, 10);

    if(checkUser){
        user.password = hashPassword;
        user.email = hashEmail;
        db.users.push(user);
        fs.writeFile(pseudoDatabase, JSON.stringify(db, null, "\t"), (err) => {
            if(err) console.log(err);
            const token = createToken(name);
            res.cookie('userExists', false);
            res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*maxAge});
            res.redirect('/home');
        })
    }
    
});

// Registration page 
app.get('/register', (req, res) => {
    res.cookie('userExists', false);
    res.sendFile(register);
});

app.get('/home', requireAuth, (req, res) => {
    res.cookie('checkUser', false);
    res.cookie('userExists', false);
    res.sendFile(home);
})

app.get('/logout', (req, res) => {
    res.cookie('checkUser', false);
    res.cookie('userExists', false);
    res.cookie('jwt', 0, {maxAge: 1});
    res.redirect('/');
})

app.post('/username',  async (req, res) => {
    let {name, newName, password} = req.body;
    let checkUser = false;

    let data = fs.readFileSync(pseudoDatabase);
    let db = JSON.parse(data);

    let status = db.users.filter(user => {
        return user.name === name;
    })



    if(status.length > 0){
        let validPass = await bcrypt.compare(password, status[0].password)
        if(validPass){
            checkUser = true;
        }
        else res.send(`Password wrong, Please try again. <a href="/home">Go back to home</a>`);
    }
    else res.send(`Username wrong, Please try again. <a href="/home">Go back to home</a>`);

    

    if(checkUser) {
        db.users.forEach(user => {
            if(user.name === name){
                user.name = newName;
            }
        })
    fs.writeFile(pseudoDatabase, JSON.stringify(db, null, "\t"), (err) => {
        if(err) console.log(err);
        const token = createToken(newName);
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*maxAge});
        res.send(`Username Updated Successfully. <a href="/home">Go back to home</a>`);
    })
    }
    
});


app.post('/password', async (req, res) => {
    let {name, password, newPassword} = req.body;
    let hashPassword = await bcrypt.hash(newPassword, 10);
    let checkUser = false;

    let data = fs.readFileSync(pseudoDatabase);
    let db = JSON.parse(data);

    let status = db.users.filter(user => {
        return user.name === name;
    })

    if(status.length > 0){
        let validPass = await bcrypt.compare(password, status[0].password);
        if(validPass){
            checkUser = true;
        }
        else res.send(`Password wrong, Please try again. <a href="/home">Go back to home</a>`);
    }
    else res.send(`Username wrong, Please try again. <a href="/home">Go back to home</a>`)

    if(checkUser) {
        db.users.forEach(user => {
            if(user.name === name){
                user.password = hashPassword;
            }
        })
    fs.writeFile(pseudoDatabase, JSON.stringify(db, null, "\t"), (err) => {
        if(err) console.log(err);
        res.send(`Password Updated Successfully. <a href="/home">Go back to home</a>`);
    })
    }
    
});


app.post('/email', async (req, res) => {
    let {name, newEmail, password} = req.body;
    let hashEmail = await bcrypt.hash(newEmail, 10);
    let checkUser = false;

    let data = fs.readFileSync(pseudoDatabase);
    let db = JSON.parse(data);

    let status = db.users.filter(user => {
        return user.name === name;
    })

    if(status.length > 0){
        try{
                    let validPass = await bcrypt.compare(password, status[0].password);
                    if(validPass){
                        checkUser = true;
                    }
                    else res.send(`Password wrong, Please try again. <a href="/home">Go back to home</a>`);
            }catch(err){
                console.log(err);
            }
    }
    else res.send(`Username wrong, Please try again. <a href="/home">Go back to home</a>`)

    if(checkUser) {
        db.users.forEach(user => {
            if(user.name === name){
                user.email = hashEmail;
            }
        })
    fs.writeFile(pseudoDatabase, JSON.stringify(db, null, "\t"), (err) => {
        if(err) console.log(err);
        res.send(`Email Updated Successfully. <a href="/home">Go back to home</a>`);
    })
    }
});

app.post('/delete', async (req, res) => {
    let {name, password} = req.body;
    let checkUser = false;

    let data = fs.readFileSync(pseudoDatabase);
    let db = JSON.parse(data);

    let status = db.users.filter(user => {
        return user.name === name;
    })

    if(status.length > 0){
        let validation = await bcrypt.compare(password, status[0].password);
        if(validation){
            checkUser = true;
        }
        else res.send(`Password wrong, Please try again. <a href="/home">Go back to home</a>`);
    }
    else res.send(`Username wrong, Please try again. <a href="/home">Go back to home</a>`)

    
    if(checkUser) {
    let updatedDb = {users: []};
    updatedDb.users = db.users.filter(user => {
        return !user.name.includes(name);
    })
    fs.writeFile(pseudoDatabase, JSON.stringify(updatedDb, null, "\t"), (err) => {
        if(err) console.log(err);
        res.cookie('jwt', 0, {maxAge: 1});
        res.redirect('/');
    });
    }
})


// app.listen(port);
app.listen(process.env.PORT || port, () => console.log(`listening at http://localhost:${port}`));

