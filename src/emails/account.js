const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (eamil, name) => {
    sgMail.send({
        to: eamil,
        from: 'mohammad.h.karem@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancelEmail = (eamil, name) => {
    sgMail.send({
        to: eamil,
        from: 'mohammad.h.karem@gmail.com',
        subject: 'Sorry to see yo go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}