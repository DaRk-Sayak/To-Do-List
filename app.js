//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const date = require(__dirname + "/date.js");
const app = express();

const day = date.getDate()

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Sayak:Sayak1Sarkar@cluster0.ud676.mongodb.net/todoListDB", { useUnifiedTopology: true, useNewUrlParser: true });

const listScheme = new mongoose.Schema({
    item: String
});

const ListSchema = new mongoose.Schema({
    name: String,
    item: [listScheme]
})

const Item = mongoose.model("Item", listScheme);
const List = mongoose.model("List", ListSchema);

const item1 = new Item({
    item: "Welcome to Todo_List!"
})

const item2 = new Item({
    item: "Hit the + to add a new Item."
})

const item3 = new Item({
    item: "<-- Hit this to delete an Item."
})

const itemsArray = [item1, item2, item3]

app.get("/:custom", (req, res) => {

    const custom = req.params.custom

    List.findOne({ name: custom }, (err, result) => {
        if (!err) {
            if (!result) {
                const list = new List({
                    name: custom,
                    item: itemsArray
                });
                list.save();
                res.redirect("/" + custom)
            }
            else {
                res.render("list", {
                    listTitle: result.name,
                    day: day,
                    newItems: result.item
                });
            }
        }
    })

})



app.get("/", (req, res) => {

    let day = date.getDate()
    Item.find({}, (err, result) => {
        if (result.length === 0) {
            Item.insertMany(itemsArray, (err) => {
                if (err)
                    console.log(err);
                else
                    console.log("Success");
            });
            res.redirect("/")
        }
        else {
            res.render("list", {
                listTitle: "Today",
                day: day,
                newItems: result
            });
        }
    })
})

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        item: itemName
    });

    if (listName === "Today") {
        item.save()
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, (err, result) => {
            if (!err) {
                result.item.push(item)
                result.save()
                res.redirect("/" + listName)
            }
        })
    }
})

app.post("/delete", (req, res) => {
    const checkbox = req.body.check;
    const listName = req.body.listCheck
    if (listName === "Today") {
        Item.find({}, (errr, result) => {
            if (result.length > 3) {
                Item.findByIdAndRemove(checkbox, (err) => {
                    if (err)
                        console.log(err);
                    else {
                        res.redirect("/");
                    }
                })
            }
            else
                res.redirect("/");
        })
    } else {
        List.findOne({ name: listName }, (err, result) => {
            List.find({},(err,result)=>{
                if(result.length > 3){
                    List.findOneAndUpdate({name: listName},{$pull: {item: {_id: checkbox}}},(err,result)=>{
                        if(!err)
                            res.redirect("/"+listName);
                    })
                }
            })
        })
    }
})   

app.listen(3000, () => {
    console.log("Server started on port 3000");
})