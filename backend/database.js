import mongoose from 'mongoose'
 
 RunDatabase().catch(err => console.log(err));
 
 export async function RunDatabase() {
     await mongoose.connect('mongodb+srv://sanchitjain00028:SxmHCoUkhgh5ouWm@socialdraw.v45va.mongodb.net/?retryWrites=true&w=majority&appName=socialdraw');
     console.log("Connection to the database is succesfull")
     // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
 }