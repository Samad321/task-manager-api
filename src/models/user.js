const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

// use scheme becuase we can edit user data before and after save user data change user data ,and scheme used for many thing
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('The age must more than 0')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is vaild')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avater: {
        type: Buffer
    }
}, {
    timestamps: true
})

// not store any kind of data only virtual
// for relationship
userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    // toObject provide by mongoose,  
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avater

    return userObject
}

// we use methods because we deal with properte (instance) on user
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// we use statics because we deal with model rather instance
userSchema.statics.findByCredentials = async (email, password) => {
    // check email 
    const user = await User.findOne({ email })
    if (!user) {
        // this throw catch in login routre
        throw Error('Enable to login')
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw Error('Enable to login')
    }

    return user
}

// before save data this block method is runnig ,and post use if we want after save change user data
//change password to hash code
userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    // this method used for left this method and continuse
    next()
})

// when user deleted account so delete all task which relate current user
userSchema.pre("remove", async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })

    next()
})
const User = mongoose.model('User', userSchema)

module.exports = User