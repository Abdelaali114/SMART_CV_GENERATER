const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const authRoutes = require("./routes/auth"); // Importer les routes d'authentification

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Assurez-vous que le répertoire est en minuscule

// Connection to database
mongoose.connect('mongodb://localhost:27017/pppdb', {});
const db = mongoose.connection;
db.on("error", () => console.log("Error in connection to database"));
db.once("open", () => console.log("Connected to database"));

// Use the auth routes (Login)
app.use('/auth', authRoutes);

// //////////Signup//////////////////
app.post("/Sign_Up", (req, res) => {
    var User_name = req.body.User_name;
    var Email = req.body.Email;
    var Number_phone = req.body.Number_phone;
    var password = req.body.password;

    var Data = {
        "User_name": User_name,
        "Email": Email,
        "Number_phone": Number_phone,
        "password": password
    };

    db.collection('users').insertOne(Data, (err, collection) => {
        if (err) {
            console.error("Error registering user:", err);
            res.status(500).send('Error registering user');
            return;
        }
        console.log("Registered Successfully");
        res.redirect('/login.html');
    });
});

app.get('/Sign_Up', (req, res) => {
    res.sendFile('signup.html', { root: 'public' });
});

//////Form creation//////////////
app.get('/submit-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'creation.html'));
});

// Handle form submission
app.post('/submit-form', async (req, res) => {
    const formData = req.body;

    // Function to safely replace placeholders
    function replacePlaceholder(template, placeholder, value) {
        return template.replace(new RegExp(`{${placeholder}}`, 'g'), value || '');
    }

    // Read the template file
    fs.readFile(path.join(__dirname, 'test.htm'), 'utf-8', async (err, data) => {
        if (err) {
            console.error("Error reading template file:", err);
            res.status(500).send('Error reading template file');
            return;
        }

        try {
            // Replace placeholders with form data
            let modifiedData = replacePlaceholder(data, 'Name', `${formData.firstName || ''} ${formData.lastName || ''}`);
            modifiedData = replacePlaceholder(modifiedData, 'Titre_parcours', formData.parcours1 || '');
            modifiedData = replacePlaceholder(modifiedData, 'time', formData.parcours2 || '');
            modifiedData = replacePlaceholder(modifiedData, 'Parcours_text',formData.parcours3 || '');
            modifiedData = replacePlaceholder(modifiedData, 'Titre_formation', formData.formation1 || '');
            modifiedData = replacePlaceholder(modifiedData, 'formation_time', formData.formation2 || '');
            modifiedData = replacePlaceholder(modifiedData, 'Detail',formData.formation3 || '');
            modifiedData = replacePlaceholder(modifiedData, 'P1', formData.Competances1 || '');
            modifiedData = replacePlaceholder(modifiedData, 'P2', formData.Competances2 || '');
            modifiedData = replacePlaceholder(modifiedData, 'P3', formData.Competances3 || '');
           
            modifiedData = replacePlaceholder(modifiedData, '716-555-0000', formData.phoneNumber || '');
            modifiedData = replacePlaceholder(modifiedData, 'Email', formData.email || '');

            // Generate PDF from modified HTML using Puppeteer
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.setContent(modifiedData, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4' });

            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
            res.send(pdfBuffer);
        } catch (pdfError) {
            console.error("Error generating PDF:", pdfError);
            res.status(500).send('Error generating PDF');
        }
    });
});

///////////send mail contactus/////////////
app.post('/contact_us', (req, res) => {
    const { name, subject, phone, email, message } = req.body;

    // Create a transporter object
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    // Email options
    let mailOptions = {
        from: email,
        to: 'abdellaalimohamad4321@gmail.com',
        subject: subject,
        text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
        res.status(200).json({ success: true });
    });
});
////// Final /////////////////////
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
