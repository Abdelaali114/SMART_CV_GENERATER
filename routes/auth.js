const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const User = require('../models/user'); // Adjust the path as needed

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Render login form
router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: 'public' });
});

// Handle login form submission
router.post('/login', async (req, res) => {
    const { uname, password } = req.body;
    console.log("Login attempt:", { uname, password });
    
    try {
        const user = await User.findOne({ User_name: uname });
        
        if (!user) {
            console.log("Username not found");
            return res.send('Username not found');
        }

        console.log("Stored password:", user.password);
        console.log("Entered password:", password);

        if (password === user.password) {
            return res.redirect("/index1.html")
        }
        return res.send("Invalid password");
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Error during login");
    }
});


// Routes
router.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('index.html');
});

module.exports = router;
app.use('/', router);
