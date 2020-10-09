module.exports = {

    // SEND EMAIL TO PARENT WHEN BOOKING 
    sendEmailToParent : function (parentId) {
    
        // Find the email from the parentId
        models.User
        .findOne({
        attributes : ['email'],
        where: { id : parentId }
        })
        .then(user => {

            //get the user email
            let userEmail = user.dataValues.email
        
            // prepare message to send
            let message = {
            from: "lilypopins@test.com",
            to: userEmail,
            subject: "Message Test",
            text: "Plaintext version of the message",
            html:`  
            <header>
                <p>Lilypopins - Vous avez reçu une demande de garde</p>
            </header>
        
            <body>
                <p>Vous avez reçu une nouvelle demande de garde. Pour la consulter, connectez-vous dès à présent sur votre compte</p>  
                <a href="http://localhost:3000/login">Se connecter</a>
            </body> `
            }
        
            // SMTP configuration for message to send
            let transporter = nodemailer.createTransport(new smtpTransport({
                name: 'https://atelier-de-jb.fr',
                host: "ssl0.ovh.net",
                port: 465,
                secure: true, // use TLS
                auth: {
                    user: "contact@atelier-de-jb.fr",
                    pass: "AdZ92%%l9ys7@&ksIs828sh28"
                }
            }))
        
            // Verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });
        
            // Send message
            var mailOptions = message 
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send('A verification email has been sent to ' + userEmail + '.');
            });
        
        })
        .catch(err => res.status(500).json(`erreur : Impossible de récupérer l'email de l'utilisateur ID : ${parentId}`))
    }

}


