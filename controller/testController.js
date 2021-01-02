const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer/lib/smtp-transport');
const hbs = require('nodemailer-express-handlebars');

const FRONT_URL = process.env.FRONT_URL

const TRANSPORTER_NAME = process.env.TRANSPORTER_NAME
const TRANSPORTER_HOST = process.env.TRANSPORTER_HOST
const TRANSPORTER_PORT =  process.env.TRANSPORTER_PORT
const TRANSPORTER_SECURE =  process.env.TRANSPORTER_SECURE
const TRANSPORTER_AUTH_USER =  process.env.TRANSPORTER_AUTH_USER
const TRANSPORTER_AUTH_PASS =  process.env.TRANSPORTER_AUTH_PASS

module.exports = {

    test : function (req, res) {
        // SMTP configuration for message to send
        let transporter = nodemailer.createTransport(new smtpTransport({
            name: TRANSPORTER_NAME,
            host: TRANSPORTER_HOST,
            port: TRANSPORTER_PORT,
            secure: TRANSPORTER_SECURE, // use TLS
            auth: {
                user: TRANSPORTER_AUTH_USER,
                pass: TRANSPORTER_AUTH_PASS
            }
        }))
    
        // Verify connection configuration
        transporter.verify(function(error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log(`Server is ready to take our messages to test`);
            }
        });

        //attach the plugin to the nodemailer transporter
        transporter.use('compile', hbs({
            extName:'.handlebars',
            viewEngine : 'express-handlebars',
            viewPath : './templates/',
            layoutsDir: './templates/',
            // defaultLayout:'newGard',
        }));
        //send mail with options
        var mail = {
            from: 'test@lilypopins.com',
            to: 'jbbouillat@yahoo.fr',
            subject: 'Test',
            template: 'newGard',
            text : 'coucou'
        }
        // Send message
        transporter.sendMail(mail, function (err) {
            if (err) { 
                return res.status(500).send({ msg: err.message }) }
            res.status(200).send('A verification email has been sent')
        }) 
    }
}