/*********************************************************************************
 * WEB322 – Assignment 03
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Andrei Agmata Student ID: 103696209 Date: October 2021
 *
 * Online (Heroku) Link: https://fathomless-plateau-99013.herokuapp.com/
 *
 ********************************************************************************/
const express = require("express");
const multer = require("multer");
const app = express();
const path = require("path");
var data = require("./data-service.js");
const fs = require("fs");
const exphbs = require("express-handlebars");

var HTTP_PORT = process.env.PORT || 8080;

app.engine(".hbs", exphbs({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", ".hbs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./public/images/uploaded"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/images/add", upload.single("imageFile"), function (req, res) {
  res.redirect("/images");
});

app.get("/images", function (req, res) {
  fs.readdir(
    path.join(__dirname, "./public/images/uploaded"),
    function (err, items) {
      var obj = { images: [] };
      var size = items.length;
      for (var i = 0; i < items.length; i++) {
        obj.images.push(items[i]);
      }
      res.json(obj);
    }
  );
});

app.use(express.urlencoded({ extended: true }));

app.post("/employees/add", function (req, res) {
  data.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function (req, res) {
  //res.sendFile(path.join(__dirname, "/views/home.html"));
  res.render("home");
});

app.use(express.static("public"));

app.get("/about", function (req, res) {
  //res.sendFile(path.join(__dirname, "/views/about.html"));
  res.render("about");
});

app.get("/employees/add", function (req, res) {
  //res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
  res.render("addEmployee");
});

app.get("/images/add", function (req, res) {
  //res.sendFile(path.join(__dirname, "/views/addImage.html"));
  res.render("addImage");
});

app.get("/employees", function (req, res) {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  } else {
    data
      .getAllEmployees()
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json(err);
      });
  }
});

app.get("/employees/:value", function (req, res) {
  data
    .getEmployeeByNum(req.params.value)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      res.json(err);
    });
});

app.get("/managers", function (req, res) {
  data
    .getManagers()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json(err);
    });
});

app.get("/departments", function (req, res) {
  data
    .getDepartments()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json(err);
    });
});

app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "/views/error404.html"));
});

data
  .initialize()
  .then(() => {
    console.log("Initializing");
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch(err => {
    console.log(err);
  });
