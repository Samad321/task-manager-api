const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task.js')

const app = express()

const port = process.env.PORT

//register 
// app.use((req, res, next) => {

//     res.status(503).send('This site crash for now ,soon site is avaiable')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const User = require('./models/user.js')
const Tsak = require('./models/task.js')

// const main = async () => {
//     // const task = await Tsak.findById('5e6e961171700650e80b67e0')
//     // await task.populate('owner').execPopulate()
//     // console.log(task)

//     // const user = await User.findById('5e6e9ae81624014d6c1fcb52')
//     // await user.populate('tasks').execPopulate()
//     // console.log(user.tasks)
// }

// main()