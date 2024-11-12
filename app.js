let express= require('express')
let {dbConnect, getData, postData, deleteData, updateData} = require('./controller/dbcontroller');
let app = express();
let port = 9110;
let cors = require('cors');
let swaggerUi = require('swagger-ui-express');
let swaggerDocument = require('./swagger.json');
let packageNumber = require('./package.json');
let {ObjectId} = require('mongodb')

swaggerDocument.info.version = packageNumber.version;
app.use('/api-doc',swaggerUi.serve,swaggerUi.setup(swaggerDocument))

let key = "123Hdn4jwnd404"

app.use(express.json())
app.use(cors())

app.get('/health',(req,res) => {
    res.send('Hii from express')
});

app.get('/location',async (req,res) => {
    let query = {};
    let collection =  "location"
    let authKey = req.headers ['x-access-auth']
    if(authKey == key){
        let output = await getData(collection,query)
        res.status(200).send(output)
    }else{
        res.status(401).send(`Unauthorised`)
    }
})
app.get('/resturants',async(req,res)=>{
    let query ={};
    let collection="resturants"
    let output = await getData(collection,query)
    res.send(output)
})
app.get('/mealType',async(req,res)=>{
    let query ={};
    let collection="mealType"
    let output = await getData(collection,query)
    res.send(output)
})
app.get('/resturants',async(req,res)=>{
    let query ={};
    let stateId=req.query.stateId;
    let collection="resturants"
    if(stateId){
        query={state_id:Number(stateId)}
    }else{
        query={}
    }
    let output = await getData(collection,query)
    res.send(output)
})
app.get('/filter/:mealId',async(req,res) => {
    let query = {}
    let mealId = Number(req.params.mealId)
    let cuisineId = Number(req.query.cuisineId)
    let hcost = Number(req.query.hcost)
    let lcost = Number(req.query.lcost)
    if (cuisineId){
        query = {
            "mealTypes.mealtype_id":mealId,
            "Cuisines.cuisine_id":cuisineId
        }
    }else if(hcost & lcost){
        query = {
            "mealTypes.mealtype_id":mealId,$and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else{
        query = {
            "mealTypes.mealtype_id":mealId
        }
    }
   
    let collection = "resturants";
    let output = await getData(collection,query);
    res.send(output)
})
app.post('/menuDetails',async(req,res)=>{
    if(Array.isArray(req.body.id)){
        let query ={menu_id:{$in:req.body.id}};
        let collection='menu'
        let output = await getData(collection,query);
        res.send(output)
    }else{
        res.send(`Please pass data in format of {"id":[1,2,3]}`)
    }
})
//placeorder
app.post('/placeOrder',async(req,res) => {
    let data = req.body;
    let collection = 'order'
    let response = await postData(collection,data);
    res.send(response)
})
app.get('/orders',async(req,res)=>{
    let query = {};
    if (req.query.email){
        query = {email:req.query.email}
    }
    let collection = "order";
    let output = await getData(collection,query);
    res.send(output)
})
app.put('/updateOrder',async(req,res)=>{
    let collection ="order"
    let condition = {"_id":new ObjectId(req.body._id)}
    let data = {
        $set:{
            "status":req.body.status
        }
    }
    let response = await updateData(collection,condition,data)
    res.send(response)
})
app.delete('/deleteOrder',async(req,res)=>{
    let collection ="order"
    let condition ={"_id":new  ObjectId(req.body._id)}
    let response = await deleteData(collection,condition);
    res.send(response)
})
app.listen(port,(err) => {
    dbConnect()
    if(err) throw err;
    console.log(`Server is running on port ${port}`)
})

