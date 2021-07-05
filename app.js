const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
dotenv.config({ path: './.env' });

//View engine
app.set('view engine', 'ejs');

//connect to Db

mongoose.connect(process.env.DB_LOCAL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

const maxAge = 3 * 24 * 60 * 60;


app.post('/login', async (req, res) =>{
    const { email, password } = req.body;

    const user = await User.findOne({email});

    if(!email && !password) {
        return res.json({status: 'errorBoth'});
    }

    if(!email) {
        return res.json({status: 'errorEmail', error: 'Please enter an email'});
    }

    if(!password) {
        return res.json({status: 'errorPassword', error: 'Please enter an password'});
    }

    if(!user) {
        return res.json({status: 'error', error: 'Invalid username or password'});
    }

    if(await bcrypt.compare(password, user.password)) {

        const token = jwt.sign(
            {
                id: user._id
            },
            'kenanbilalnatiqhuseynguler12'
        );

        res.cookie('jwt', token);
        res.json({user: user._id});
    }else {
        res.json({status: 'error', error: 'Invalid username/password'});
    }
});




//check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        } )
    }
    else {
        res.locals.user = null;
        next();
    }
}

app.get('*', checkUser);

app.get('/', (req, res) => {
    res.render('index');
});



app.get('/signup', (req, res) => {
    res.render('signup') ;
});


app.post('/signup', async (req, res) => {
    const { email, password: passwordHash } = req.body;
    
    if(!email && !passwordHash) {
        return res.json({status: 'errorBoth'});
    }

    if(!email) {
        return res.json({status: 'errorEmail', error: 'Please enter an email'});
    }

    if(!passwordHash) {
        return res.json({status: 'errorPassword', error: 'Please enter an password'});
    }
    const password = await bcrypt.hash(passwordHash, 10);

    try {
        const user = await User.create({email, password});

        res.json({
            status: 'success',
            user
        });
    }
    catch(error) {
        res.json({status: 'error', error});
    }

});

app.get('/login', (req, res) => {
    res.render('login');
});



const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
            if(err) {
                res.render('login');
            }
            else {
                next();
            }
        });
    }
    else {
        res.render('login');
    }
}


app.get('/tours', requireAuth, (req, res) => res.render('tours'));


app.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.render('index'); 
});



app.listen(3000);