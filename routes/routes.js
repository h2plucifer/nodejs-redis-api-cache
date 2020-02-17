const express=require('express');
const router=express.Router();
const fetch=require('node-fetch');

async function getRepos(){
    try{

    }catch(err){
        console.log(err);
        res.status(500);
    }
}


router.get('/:username',getRepos);
router.get('/posts',getPosts);

module.exports=router;