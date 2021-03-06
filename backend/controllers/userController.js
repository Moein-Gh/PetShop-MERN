import User from '../models/userModel.js'
import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'

//@desc     auth user & get a token
//@route    POST /api/users/login
//@access   public
const authUser = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body
  const user = await User.findOne({ phoneNumber })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,

      token: generateToken(user._id),
    })
  } else {
    res.status(404)
    throw new Error('Invalid email or password')
  }
})

//@desc     Register a new user
//@route    POST /api/users
//@access   public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, password } = req.body
  const userExists =
    (await User.findOne({ phoneNumber })) || (await User.findOne({ email }))

  if (userExists) {
    res.status(400)
    throw new Error('A User with this email or phone number already exists')
  }
  const user = await User.create({ name, email, phoneNumber, password })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid User data')
  }
})

//@desc     get user profile
//@route    GET /api/users/profile
//@access   private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User Not Found')
  }
})

//@desc     get user profile
//@route    PUT /api/users/profile
//@access   private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber
    if (req.body.password) {
      user.password = req.body.password
    }
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error('User Not Found')
  }
})

//@desc     get all users
//@route    GET /api/users
//@access   private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

//@desc     delete user
//@route    DELETE /api/users/:id
//@access   private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    await user.remove()
    res.json({ message: 'User Removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//@desc     get user bt id
//@route    GET /api/users/:id
//@access   private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//@desc     update user
//@route    PUT /api/users/:id
//@access   private/admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber
    user.isAdmin = req.body.isAdmin

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User Not Found')
  }
})

export {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
}
