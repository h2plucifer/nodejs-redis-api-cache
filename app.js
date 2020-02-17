const express=require('express');
const cache=require('memory-cache')
const axios=require('axios');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const path=require('path');
const fetch=require('node-fetch');

const app=express();
//const cache=new MCache.Cache();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));

app.set('views',path.resolve(__dirname,"views"));
app.set("view engine","ejs");


app.locals.data=[{title:"101"},{title:"102"}]


const cacheMiddleware =(duration)=>{
    return (req,res,next)=>{
        let key="TEST"+req.originalUrl || req.url;
        console.log("KEY ::"+key)
        let cachedData =cache.get(key) ;
        if(cachedData){
            console.log("cache get  Inside cached:: "+cache.get(key));
            console.log("Cched data :: "+cachedData)
            res.send(cachedData);
            return;
        }
        else{
            res.sendResponse=res.send;
           // console.log("Inside cache ..res.send"+res.send);
            res.send=(body) =>{
                cache.put(key,body,duration*1000);
                console.log("cache get :: "+cache.get(key))
                res.sendResponse(body)
            }
            next();
        }
    }
}


app.get("/",(req,res)=>{
    res.render("index", {data:app.locals.data})
})

app.get("/posts",cacheMiddleware(10),(req,res)=>{
    fetch("https://jsonplaceholder.typicode.com/posts")
        .then(response=>response.json())
        .then(data=>{
            app.locals.data=data;
            console.log("Without cache  :: ")
            res.redirect("/")
            //res.send(data)
        })
})

app.post("/posts",(req,res)=>{
    fetch("http://www.jsonplaceholder.typicode.com/posts")
})
app.listen(8000,()=>{
    console.log("listening at 8000")
})