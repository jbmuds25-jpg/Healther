const router = require("express").Router();
const Record = require("../models/Record");
const User = require("../models/User");


// match patient with doctor
router.get("/match", async (req,res)=>{
  const doctor = await User.findOne({ role:"doctor" });
  res.json(doctor);
});


// save health record
router.post("/record", async (req,res)=>{
  const record = await Record.create(req.body);
  res.json(record);
});


// get patient records
router.get("/records/:patient", async (req,res)=>{
  const records = await Record.find({ patient:req.params.patient });
  res.json(records);
});

module.exports = router;
