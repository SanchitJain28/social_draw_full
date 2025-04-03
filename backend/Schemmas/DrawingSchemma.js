import mongoose from 'mongoose';
 const { Schema, model } = mongoose;
 const DrawingSchemma = new Schema({
     title: {
         type: String,
         required: true,
     },
     elements: {
         type: [Schema.Types.Mixed],
         required: true,
         default: [],
     },
     userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
     }
 }, { timestamps: true });
 
 export const drawing = model('drawing', DrawingSchemma);