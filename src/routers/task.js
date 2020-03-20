const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')


const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /taskes?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const query = req.query;
    const match = {}
    const sort = {}

    if (query.completed) {
        match.completed = query.completed === 'true'
    }

    if (query.sortBy) {
        const parts = query.sortBy.split(':')
        // like this { createAt: 1 }
        // [parts[0]] add value for object
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }


    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: query.limit,
                skip: parseInt(query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)

    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['dscription', 'completed']
    const isVaildOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isVaildOperation) {
        return res.status(400).send({ error: 'Invaild update!' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(task)
    } catch (e) {
        res.status(4000).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(505).send(e)
    }
})

module.exports = router