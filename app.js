//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//create db and connect to mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//creation of schema
const itemsSchema = new mongoose.Schema({
  name: String
})

//creation of mongoose model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To-Do List!!!!!"
})

const item2 = new Item({
  name: "Hit + to add item."
})

const item3 = new Item({
  name: "Check to box if task done!!"
})

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Sucessfully added items in array");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })




});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item)
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  // item.save();
  // res.redirect("/");

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  const checkItemid = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkItemid, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("sucess");
        res.redirect("/")
      }
    })
  } else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkItemid}}}, (err, foundList)=>{
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }
})

app.get("/:parameters", (req, res) => {
  const parameters = req.params.parameters;

  List.findOne({ name: parameters }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //new list
        const list = new List({
          name: parameters,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + parameters);
      } else {
        //show list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })



})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
