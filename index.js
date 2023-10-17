const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
let userSchema = new mongoose.Schema({
  username: String
})
let User = mongoose.model('User', userSchema);
let exerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date

})
let Exercise = mongoose.model('Exercise', exerciseSchema);
app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post('/api/users', async(req, res) =>{
  
  let newUser = new User({username: req.body.username});
  try{
    const user = await newUser.save();
    res.json(user)
    
  }catch(err){
    console.log(err);
  }
  
  })
app.get('/api/users', async(req, res) =>{
  const users = await User.find({}).select("_id username");
  if(!users){
    res.json({error: "No users found"})
  }else{
    res.json(users);
  }
})
app.post('/api/users/:_id/exercises', async(req, res) =>{
  let id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  if(!date){
    date = new Date().toDateString();
  }else{
    date = new Date(date).toDateString();
  }
  try{
    const user = await User.findById(id);
    if(!user){
      res.json({error: "User not found"})
    }else{
      let exerciseObj = new Exercise ({
        userId: id,
        description: description,
        duration: duration,
        date: date
        
      })
      const exercise = await exerciseObj.save();
      
      res.json({
        _id: user._id,
        username: user.username,
        date,
        duration: parseInt(duration),
        description
      })
    }
  }catch(err){
    console.log(err);
  }
  
  })
app.get(
  '/api/users/:_id/logs',
  async (req, res) => {
    let id = req.params._id;
    let from = req.query.from;
    let to = req.query.to;
    let limit = req.query.limit;
    try{
      const user = await User.findById(id);
      if(!user){
        res.json({error: "User not found"})
      }else{
        let exercises = await Exercise.find({userId: id}).limit(limit);
        let log = exercises.map((exercise) => {
          return {description: exercise.description, duration: exercise.duration, date: exercise.date.toDateString()}
        })
        res.json({
          _id: user._id,
          username: user.username,
          count: exercises.length,
          log
        })
      }
    }catch(err){
      console.log(err);
    }
  }
  )




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
