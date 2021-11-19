/*********************************************************************************
 * WEB322 – Assignment 03
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Andrei Agmata Student ID: 103696209 Date: November 2021
 *
 * Online (Heroku) Link: https://thawing-harbor-10364.herokuapp.com/
 *
 ********************************************************************************/
const express = require("express");
const multer = require("multer");
const app = express();
const path = require("path");
var data = require("./data-service.js");
const fs = require("fs");
const exphbs = require("express-handlebars");
const { Console } = require("console");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
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
      //res.json(obj);
      res.render("images", obj);
    }
  );
});

app.use(express.urlencoded({ extended: true }));

app.post("/employees/add", function (req, res) {
  data.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

app.post("/employee/update", (req, res) => {
  console.log(req.body);
  data
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch(err => {
      console.log(err);
    });
});

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

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
        //res.json(data);
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch(err => {
        //res.json(err);
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then(data => {
        //res.json(data);
        res.render("employees", { employees: data });
      })
      .catch(err => {
        //res.json(err);
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then(data => {
        //res.json(data);
        res.render("employees", { employees: data });
      })
      .catch(err => {
        //res.json(err);
        res.render("employees", { message: "no results" });
      });
  } else {
    data
      .getAllEmployees()
      .then(data => {
        //res.json(data);
        res.render("employees", { employees: data });
      })
      .catch(err => {
        //res.json(err);
        res.render("employees", { message: "no results" });
      });
  }
});

app.get("/employees/:empNum", function (req, res) {
  data
    .getEmployeeByNum(req.params.empNum)
    .then(data => {
      res.render("employee", { employee: data });
    })
    .catch(err => {
      console.log(err);
      //res.json(err);
      res.render("employee", { message: "no results" });
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
      res.render("departments", { departments: data });
    })
    .catch(err => {
      //res.json(err);
      res.render("departments", { message: "no results" });
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
