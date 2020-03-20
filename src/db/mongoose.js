const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODD_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
