const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const collection_signup = require("./database")



app.set("view engine","ejs")
app.use(express.json())
app.use(express.static("public"))//za da moje express da se izpolzva v statichni filove v papkata public i dobre e purvo da e server.js i posle 
app.use(express.urlencoded({extended:false}))

app.locals.nameasd = "no name"
app.locals.ordersList = "no orders"
app.locals.email_check = "no email"

app.locals.error_login = 0
app.locals.error_signup = 0

app.get("/",async (req,res)=>{
    if(app.locals.email_check != "no email")
    {
        const checking = await collection_signup.findOne({email:app.locals.email_check})
        app.locals.ordersList = checking.orders.toString()
    }
    console.log(app.locals.ordersList + "asd")
    
    res.render(__dirname + "/view/index.ejs",{object1:app.locals.nameasd, object2:app.locals.ordersList})
})

app.get("/login",(req,res)=>{
    res.render(__dirname + "/view/login.ejs",{e_l: app.locals.error_login})
})

app.get("/signup",(req,res) =>{
    res.render(__dirname + "/view/signup.ejs",{e_s:app.locals.error_signup})
})


let email_of_user;
let user_string;
let user_id;
const date = new Date()

app.post("/update_orders", async(req,res) =>{
    
    const dborders = await collection_signup.findOne({email: email_of_user})
    
    let orders_string = req.body.orders_history + "#"
    const new_1  = await collection_signup.updateOne(
        {_id: user_id},
        {$push: {orders: orders_string}}
    )
    const new_w  = await collection_signup.updateOne(
        {_id: user_id},
        {$push: {orders: date.toJSON()}}
    )

    app.locals.ordersList = dborders.orders.toString()
    console.log(app.locals.ordersList)
    res.redirect("/")
    console.log(dborders.orders.toString())

})


let counter_signup = 0;
app.post("/signup",async (req,res)=>{
    const data = {
        name: req.body.firstname,
        email: req.body.email,
        password: req.body.password
    }
    email_of_user = req.body.email

    const existuseremail = await collection_signup.findOne({email: data.email})
    const existingpassword = await collection_signup.findOne({password: data.password})
    if(existuseremail && existingpassword)
    {
        app.locals.error_signup += 1
        res.redirect("/signup")
    }
    
    else if(existingpassword && counter_signup === 0)
    {
        app.locals.error_signup += 1
        res.redirect("/signup")
    }
    else if(existuseremail && counter_signup === 0)
    {
        app.locals.error_signup += 1
        res.redirect("/signup")
    }
    else{
        //hash pasword
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(data.password,saltrounds)
        
        data.password = hashedPassword; //replace pasword
        const userdata = await collection_signup.insertMany(data);
        console.log(userdata)
        counter_signup += 1
        app.locals.error_signup = 0
        res.render(__dirname + "/view/login.ejs",{e_l: app.locals.error_login})
    }
    
    
})


app.post("/login",async (req,res)=>{
    try{
        const check = await collection_signup.findOne({email:req.body.email})
        user_id = check._id
        
        if(!check){

            app.locals.error_login += 1
            res.redirect("/login")
        }
        else{
            const ispasswordmatch = await bcrypt.compare(req.body.password, check.password)
            if(ispasswordmatch)
            {
                app.locals.email_check = req.body.email
                email_of_user = req.body.email
                app.locals.nameasd = check.name
                app.locals.error_login = 0
                res.redirect("/")
            }else{
                app.locals.error_login += 1
                res.redirect("/login")
            }
        }
    }
    catch{
        app.locals.error_login += 1
        res.redirect("/login")
    }
})


app.listen(5000,()=>{
    console.log("Server created")
})