import express from 'express'
import Comment from '../models/Comment.js'
export const addComment=async(req,res)=>{
    const{promptId,text}=req.body;
    const newComment=await Comment.create({
        promptId,
        authorId:req.user_id,
        text,
    });
    res.send(201).json("Comment added")
}
export const getComments = async (req, res) => {
  const { promptId } = req.params;
  const comments = await Comment.find({ promptId }).populate("authorId", "name");
  res.json(comments);
}