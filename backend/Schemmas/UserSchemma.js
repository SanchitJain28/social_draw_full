import mongoose from 'mongoose';
 const { Schema, model } = mongoose;
 import jsonwebtoken from 'jsonwebtoken'
 import bcrypt from 'bcrypt'
 const UserSchemma = new Schema({
     name: {
         type: String,
         required: true,
     },
     email: {
         type: String,
         required: true,
     },
     password: {
         type: String,
         required: true,
     },
     profilePic: {
         type: String,
     },
     PhoneNo: {
         type: String,
         required: true,
     },
     refreshToken: {
         type: String,
     },
 }, { timestamps: true });
 
 UserSchemma.pre('save', async function (next) {
     if (!this.isModified("password")) { return next() }
     this.password = await bcrypt.hash(this.password, 10)
 })
 UserSchemma.methods.isPasswordCorrect = async function (password) {
     return bcrypt.compare(password, this.password)
 }
 
 UserSchemma.methods.generateAccessToken = async function () {
     const token= jsonwebtoken.sign(
         {
             id: this._id,
             name: this.name,
             email: this.password
         },
         "SanchitkaKhufiyaSecret",
         {expiresIn:"1d"}
     )
     return token
 }
 UserSchemma.methods.generateRefreshToken = async function () {
     return jsonwebtoken.sign(
         {
             id: this._id,
             name: this.name,
             email: this.password
         },
         "SanchitkaKhufiyaSecret",
         {expiresIn:"10d"}
     )
 }
 
 export const User = model('User', UserSchemma);