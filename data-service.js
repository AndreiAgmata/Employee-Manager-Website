const fs = require("fs");
const { resolve } = require("path");

var employees = [];
var departments = [];

module.exports.initialize = function () {
  var promise = new Promise((resolve, reject) => {
    try {
      fs.readFile("./data/employees.json", (err, data) => {
        if (err) reject("unable to read employees.json");
        employees = JSON.parse(data);
        console.log("Initialized - loaded employees");
      });

      fs.readFile("./data/departments.json", (err, data) => {
        if (err) reject("unable to read departments.json");
        departments = JSON.parse(data);
        console.log("Initialized - loaded departments");
      });
    } catch (ex) {
      console.log("Failed loading employees");
      console.log("Failed loading departments");
    }

    resolve("Initialize - Successfully loaded employees and departments");
  });

  return promise;
};

module.exports.getAllEmployees = function () {
  var promise = new Promise((resolve, reject) => {
    if (employees.length == 0) {
      var errorMessage = "Employees[] is empty";
      reject({ message: errorMessage });
    }

    resolve(employees);
  });

  return promise;
};

module.exports.getManagers = function () {
  var managers = [];

  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].isManager == true) {
        managers.push(employees[i]);
      }
    }

    if (managers.length == 0) {
      var errorMessage = "No managers found";
      reject({ message: errorMessage });
    }

    resolve(managers);
  });

  return promise;
};

module.exports.getDepartments = function () {
  var promise = new Promise((resolve, reject) => {
    if (departments.length == 0) {
      var errorMessage = "No departments found";
      reject({ message: errorMessage });
    }
    resolve(departments);
  });
  return promise;
};

module.exports.addEmployee = function (employeeData) {
  var promise = new Promise((resolve, reject) => {
    if (typeof employeeData.isManager === "undefined") {
      employeeData.isManager = false;
    } else {
      employeeData.isManager = true;
    }

    employeeData.employeeNum = employees.length + 1;
    employees.push(employeeData);

    resolve(employees);
  });
  return promise;
};

module.exports.getEmployeesByStatus = function (status) {
  var returnObj = [];

  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].status == status) {
        returnObj.push(employees[i]);
      }
    }
    if (returnObj.length === 0) {
      var errorMessage = "No results returned";
      reject({ message: errorMessage });
    } else {
      resolve(returnObj);
    }
  });
  return promise;
};

module.exports.getEmployeesByDepartment = function (department) {
  var returnObj = [];

  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].department == department) {
        returnObj.push(employees[i]);
      }
    }
    if (returnObj.length === 0) {
      var errorMessage = "No results returned";
      reject({ message: errorMessage });
    } else {
      resolve(returnObj);
    }
  });
  return promise;
};

module.exports.getEmployeesByManager = function (manager) {
  var returnObj = [];

  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].employeeManagerNum == manager) {
        returnObj.push(employees[i]);
      }
    }
    if (returnObj.length === 0) {
      var errorMessage = "No results returned";
      reject({ message: errorMessage });
    } else {
      resolve(returnObj);
    }
  });
  return promise;
};

module.exports.getEmployeeByNum = function (num) {
  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].employeeNum == num) {
        resolve(employees[i]);
      }
    }
    var errorMessage = "No results returned";
    reject({ message: errorMessage });
  });

  return promise;
};
