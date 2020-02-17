const express=require('express');
const redis=require('redis');
const morgan=require('morgan');
const fetch=require('node-fetch');
const bodyParser=require('body-parser');
const path=require('path');
const fs=require('fs');
const rfs=require('rotating-file-stream');

const PORT=process.env.PORT||8000;
const REDISPORT=6379;


const app=express();
const client=redis.createClient(REDISPORT)

app.set("views",path.resolve(__dirname,"views"));
app.set("view engine","ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(morgan('dev'));
const logDir=path.join(__dirname,"logs");
(fs.existsSync(logDir)||fs.mkdirSync(logDir));
const logStream =rfs.createStream('appLog.log',{interval:"1m" ,path:logDir});
app.use(morgan('combined',{stream:logStream}));

app.locals.obj=[{name:"H2p"},{name:'Sonu'}];

app.get("/",(req,res)=>{
    res.render("index",{data:app.locals.obj})
})

async function getRepos(req,res,next){
    try{
        const { username } =req.params;
        const response =await fetch(`https://api.github.com/users/${username}`);
        const data = await response.json();
        const repos =data.pubic_repos;

        client.setex(username,3600,repos);
        res.send(client.get(username));


    }catch(err){
        console.log(err);
        res.status(500);
    }
}

app.get('/repos/:username',getRepos);

app.listen(PORT,()=>{console.log(`server listening at port ${PORT}`)})