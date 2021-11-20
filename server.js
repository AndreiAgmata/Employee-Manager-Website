/*********************************************************************************
 * WEB322 – Assignment 05
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Andrei Agmata Student ID: 103696209 Date: November 2021
 *
 * Online (Heroku) Link: https://protected-wildwood-38954.herokuapp.com/
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
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
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
  data
    .getDepartments()
    .then(data => {
      res.render("addEmployee", { departments: data });
    })
    .catch(err => {
      res.render("addEmployee", { departments: [] });
    });
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
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
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
  } else {
    data
      .getAllEmployees()
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
  }
});

app.get("/employee/:empNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  data
    .getEmployeeByNum(req.params.empNum)
    .then(data => {
      if (data) {
        viewData.employee = data; //store employee data in the "viewData" object as "employee"
      } else {
        viewData.employee = null; // set employee to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null; // set employee to null if there was an error
    })
    .then(data.getDepartments)
    .then(data => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
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
      if (data.length > 0) {
        //console.log("here");
        res.render("departments", { departments: data });
      } else {
        res.render("departments", { message: "no results" });
      }
    })
    .catch(err => {
      //res.json(err);
      res.render("departments", { message: "no results" });
    });
});

app.get("/departments/add", function (req, res) {
  //res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
  res.render("addDepartment");
});

app.post("/departments/add", function (req, res) {
  data.addDepartment(req.body).then(() => {
    res.redirect("/departments");
  });
});

app.post("/department/update", (req, res) => {
  console.log(req.body);
  data
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/departments/:departmentId", function (req, res) {
  data
    .getDepartmentById(req.params.departmentId)
    .then(data => {
      res.render("department", { department: data });
    })
    .catch(err => {
      res.status(404).send("Department Not Found");
    });
});

app.get("/department/delete/:departmentId", (req, res) => {
  data
    .deleteDepartmentById(req.params.departmentId)
    .then(data => {
      res.redirect("/departments");
    })
    .catch(err => {
      res
        .status(500)
        .send("Unable to Remove Department / Department not found");
    });
});

app.get("/employees/delete/:empNum", (req, res) => {
  data
    .deleteEmployeeByNum(req.params.empNum)
    .then(res.redirect("/employees"))
    .catch(err =>
      res.status(500).send("Unable to Remove Employee / Employee not found")
    );
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
