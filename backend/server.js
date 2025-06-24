import cors from 'cors';
import express from 'express';
import { connectToDB } from './db.js';

const app=express();
app.use (cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.json("SERVER IS RUNNING SUCCESSFULLY");
});

app.post('/signin',async(req,res)=>{
    console.log(req.body)
    await db.collection("admin").findone({email:req.body.email})
    .then((result)=>{
      console.log(result) 
      if(result?.Password==req.body.password){
        res.json({message:"Login Successfull",Values:result})
      } 
      else{
        res.json({error:"User not found. Try signing up"})
      }
    })
    .catch((e)=>console.log(e))
})

app.post('/signup',async (req, res) => {
    const { name, email, password, phone } = req.body;
    
    try {
      // Check if the email already exists
      const existingUser = await db.collection("admin").findOne({ email});
      if (existingUser) {
        return res.json({ success: false, error: "Email already exists. Please sign in." });
      }
  
      // Insert new user if email doesn't exist
      const result = await db.collection("admin").insertOne({
        Name: name,
        email: email,
        Password: password,
        Phone: phone,
      });
  
      if (result.acknowledged) {
        res.status(201).json({ success: true, message: "Signup successful", values: result });
      } else {
        res.status(500).json({ success: false, error: "Failed to sign up" });
      }
    } catch (error) {
      console.error("Error occurred during signup:", error);
      res.json({ success: false, error: "An error occurred during signup" });
    }
  });


connectToDB(()=>{
    app.listen(9000,()=>{
        console.log("server running at 9000")
    })
})