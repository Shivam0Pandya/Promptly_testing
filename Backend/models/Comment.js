import mongoose from "mongoose";
import Prompt from "../models/Prompt"
export const commentSchema=new mongoose.Schema({
    
    promptId:{type:mongoose.Schema.Types.ObjectId,ref:"Prompt"},
    authorId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    text:{type:String,required:true}
},{timestamps:true})

const Comment=mongoose.model("Comment",commentSchema);

export default Comment;