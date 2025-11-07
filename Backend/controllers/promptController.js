import express from 'express'

import Prompt from '../models/Prompt.js'

export const addPrompt=async(req,res)=>{
    const {title}=req.body;
    const newPrompt= await Prompt.create({
        title,
        createdBy:req.user_id,
        versions:[{version:1,body,editedBy:req.user_id,timestamp:new Date()}]
    });
    res.status(201).json(newPrompt);
}

export const getPrompts = async (req, res) => {
  const prompts = await Prompt.find().populate("createdBy", "name");
  res.json(prompts);
};

export const requestPromptUpdate=async(req,res)=>{
    const {id}=req.params;
    const {body}=req.body;
    const prompt=await Prompt.findById(id);
    if(!prompt){
        return res.status(404).json({message:"Prompt not found"});
    }
    if(prompt.createdBy.toString()==req.user_id.toString()){
        const newVersion={
            version:prompt.versions.length+1,
            body,
            editedBy:req.user_id,
            timestamp:new Date()
        };
        prompt.versions.push(newVersion);
        await prompt.save();
        res.json(prompt);
        return res.json({message:"Prompt updated successfully by owner"});
    }
    prompt.pendingUpdates.push({
        suggestedBody:body,
        suggestedBy:req.user_id,
        timestamp:new Date(),
        status:"pending"
    });
    await prompt.save();
    res.json({message:"Update request submitted successfully"
    })
}

export const approvePromptUpdate=async(req,res)=>{
    const {promptId,updateId}=req.params;
    const prompt=await Prompt.findById(promptId);
    if(!prompt){
        return res.status(404).json({message:"Prompt not found"});
    }
    const update = prompt.pendingUpdates.id(updateId);
    if (!update || update.status !== "pending")
      return res.status(400).json({ message: "Invalid update request" });

    prompt.body = update.suggestedBody;
    prompt.versions.push({
    version: prompt.versions.length + 1,
    body: update.suggestedBody,
    editedBy: update.suggestedBy,
    timestamp: new Date(),
  });
    update.status ="approved";
    await prompt.save();
    res.json({message:"Prompt update approved and applied"});
}

export const rejectPromptUpdate=async(req,res)=>{
    const {promptId,updateId}=req.params;
    const prompt=await Prompt.findById(promptId);
    if(!prompt){
        return res.status(404).json({message:"Prompt not found"});
    }
    if (prompt.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });

    const update = prompt.pendingUpdates.id(updateId);
    if (!update || update.status !== "pending")
      return res.status(400).json({ message: "Invalid update request" });
    update.status= "rejected";
    await prompt.save();
    res.json({message:"Prompt update rejected"});
}