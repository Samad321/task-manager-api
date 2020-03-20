const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../models/user.js')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')


const router = express.Router()

// create account
router.post('/users', async (req, res) => {
    const user = User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// logout user form current place
router.post('/users/logout', auth, async (req, res) => {
    try {
        // return all token except exsit token
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// logout all user from any place
router.post('/users/logoutAll', auth, async (req, res) => {
    try {

        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Update user
router.patch('/users/me', auth, async (req, res) => {
    // return only key value
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isVaildOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isVaildOperation) {
        return res.status(400).send({ error: 'Invaild updates!' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(505).send(e)
    }
})


// multer used for get profile picture
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callBack) {
        //no space between regular expression
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callBack(new Error('Please provide image'))
        }

        callBack(undefined, true)
    }
})

// Create and update user profile
// for here we have two middleware
router.post('/users/me/avater', auth, upload.single('avater'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()

    req.user.avater = buffer
    await req.user.save()

    res.send()
}, (error, req, res, next) => {
    // callBack dwam lagal middleware esh daka lo esta
    res.status(400).send({ 'error': error.message })
})

// Delete user profile
router.delete('/users/me/avater', auth, async (req, res) => {
    req.user.avater = undefined
    await req.user.save()

    res.send()
})

//Get user profile
router.get('/users/:id/avater', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avater) {
            throw Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avater)

    } catch (e) {
        res.status(404).send('not found')
    }
})

module.exports = router