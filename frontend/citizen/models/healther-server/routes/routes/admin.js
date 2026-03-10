const router = require("express").Router();
const User = require("../models/User");

// view all users
router.get("/users", async (req,res)=>{
  const users = await User.find();
  res.json(users);
});

// delete user
router.delete("/user/:id", async (req,res)=>{
  await User.findByIdAndDelete(req.params.id);
  res.json({message:"User deleted"});
});

module.exports = router;
