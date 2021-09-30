const e = require('express');
const exp=require('express');
const date=require(__dirname+"/date.js"); 
const app=exp()

const mongoose=require('mongoose')

app.set('view engine','ejs');
app.use(exp.urlencoded({extended:true}))

app.use(exp.static("public"));
app.listen(process.env.PORT || 3000,function(req,res)
{
   console.log("Hello i am running");
})

mongoose.connect("mongodb://localhost:27017/todolistDB2")

const itemSchema=new mongoose.Schema({
    name:String
})

const Item=mongoose.model("Item",itemSchema)

const item1=new Item
(
    {
        name:"Welcome to todo list"
    }
)

const item2=new Item
(
    {
        name:"Hit + to add new items"
    }
)

const item3=new Item
(
    {
        name:"<-- Check this to delete item"
    }
)

const defaultItems=[item1,item2,item3]

const listSchema=new mongoose.Schema({
    name:String,
    items:[itemSchema]
})

const List=mongoose.model("List",listSchema)

app.get("/",function(req,res)
{
    // let today=new Date();

    // // let currentDay=today.getDay();

    // let options={weekday:"long",day:"numeric",month:"long"};
    
    // let day=today.toLocaleDateString("en-US",options);
    
    let day=date.getDay()  
   Item.find({},function(err,results)
   {
        if(results.length===0)
        {
            Item.insertMany(defaultItems,function(err)
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Items added successfully");
                }
            });
            res.redirect("/")
        }
        else
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
            res.render("list",{listTitle:day,newlistItem:results})
            }

        } 
   })
   

})

app.get('/:listType',function(req,res)
{
    const customList=req.params.listType
    List.findOne({name:customList},function(err,results)
    {
        if(!err)
        {
            if(!results)
            {
                const list=new List({
                    name:customList,
                    items:defaultItems
            
                })
            
                list.save() 
                res.redirect("/"+customList)

            }
            else
            {
              res.render("list",{listTitle:results.name,newlistItem:results.items})
             
            }
        }
    })
        
})


app.post("/",function(req,res)
{
    
    const userItem=req.body.userInput
    const listName=req.body.list

    const nextItem=new Item
    (
        {
            name:userItem
        }
    )

    let today=date.getDay()
    // let options={weekday:"long"}
    // let day=today.toLocaleDateString("en-us",options)
    // console.log(day);
    if(listName===today)
    {
      nextItem.save()
      res.redirect("/")
    } 
    else
    {
       List.findOne({name:listName},function(err,results)
       {
          if(err)
          {
             console.log(err)
          }
          else
          {
              results.items.push(nextItem)
              results.save()
              res.redirect("/"+listName)
          }
       })
    } 
})

app.post("/delete",function(req,res)
{
    const checkeditem=req.body.check;
    const hideItem=req.body.hide;

    if(hideItem===date.getDay())
    {
        Item.findByIdAndRemove(checkeditem,function(err)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Successfully deleted");
               
            }
            res.redirect("/")
        })
    }
    else
    {
     List.findOneAndUpdate({name:hideItem},{$pull:{items:{_id:checkeditem}}},function(err,results)
     {
         if(err)
         {
             console.log(err)
         }
         else
         {
          
            res.redirect("/"+hideItem)
         }
     })   
    }


   

})