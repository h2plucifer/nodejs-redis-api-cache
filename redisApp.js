const express=require('express');
//const mcache=require('memory-cache')
const axios=require('axios');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const path=require('path');
const fetch=require('node-fetch');
const redis=require('redis')
const redisPORT=6379;

const client=redis.createClient(redisPORT);
const app=express();
//const cache=new MCache.Cache();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));

app.set('views',path.resolve(__dirname,"views"));
app.set("view engine","ejs");


app.locals.data=[{title:"101"},{title:"102"}]




app.get("/",(req,res)=>{
    client.flushall();
    res.render("index", {data:app.locals.data})
})

app.get("/posts",(req,res)=>{
    fetch("https://jsonplaceholder.typicode.com/posts")
        .then(response=>response.json())
        .then(data=>{
            app.locals.data=data;
            console.log("Without cache  :: ")
            res.redirect("/")
            //res.send(data)
        })
})

function setResponse(username,repos){
    return `<h2>${username} has ${repos} repos</h2>`
}


async function getRepos(req,res,next){
    try{
        console.log('fetching data');
        const {username} =req.params;
        const response =await fetch(`https://api.github.com/users/${username}`);        
        const data=await response.json();
        const repos=data.public_repos;
        //set to redis
        client.setex(username,3600,repos);
        res.send(setResponse(username,repos));
    }
    catch(err){
        res.status(500)
    }
}

//cache middleware
function cache(req,res,next){
    const {username} =req.params;
    //console.log(client)
    client.get(username,(err,data)=>{
        if(err)throw err;
        else{
            console.log(data)
        if(data!=null){
            res.send(setResponse(username,data));
        }
        else{
            next();
        }
    }
    })

}

app.get("/repos/:username",cache,getRepos)


app.listen(8000,()=>{
    console.log("listening at 8000")
})