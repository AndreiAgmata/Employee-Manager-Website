const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "dbh9g85et3ri5c",
  "rezlpapkvfbnop",
  "50e33532208225470d9d2b7de6f9cf66475d9b0e96ca228135a54eefa5a4bfff",
  {
    host: "ec2-34-203-114-67.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.log("Unable to connect to the database:", err);
  });

const Employee = sequelize.define(
  "Employee",
  {
    employeeNum: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

const Department = sequelize.define(
  "Department",
  {
    departmentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    departmentName: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Department.hasMany(Employee, { foreignKey: "department" });

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(Employee => {
        resolve();
      })
      .then(Department => {
        resolve();
      })
      .catch(err => {
        reject("Unable to sync the database");
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(Employee.findAll());
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getManagers = function () {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Employee.findAll({
            where: {
              isManager: true,
            },
          })
        );
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.getDepartments = function () {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(Department.findAll());
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByStatus = function (empStatus) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Employee.findAll({
            where: {
              status: empStatus,
            },
          })
        );
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.addEmployee = employeeData => {
  employeeData.isManager = employeeData.isManager ? true : false;
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        for (const x in employeeData) {
          if (employeeData[x] == "") {
            employeeData[x] = null;
          }
        }
        resolve(
          Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            last_name: employeeData.last_name,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            isManager: employeeData.isManager,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate,
          })
        );
      })
      .catch(() => {
        reject("unable to create employee.");
      });
  });
};

module.exports.getEmployeesByDepartment = function (empDepartment) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Employee.findAll({
            where: {
              department: empDepartment,
            },
          })
        );
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByManager = function (empManager) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Employee.findAll({
            where: {
              manager: empManager,
            },
          })
        );
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeeByNum = function (empNum) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Employee.findAll({
            where: {
              department: empNum,
            },
          })
        );
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.updateEmployee = function (employeeData) {
  employeeData.isManager = employeeData.isManager ? true : false;
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        for (const x in employeeData) {
          if (employeeData[x] == "") {
            employeeData[x] = null;
          }
        }
        resolve(
          Employee.update(
            {
              firstName: employeeData.firstName,
              last_name: employeeData.last_name,
              email: employeeData.email,
              addressStreet: employeeData.addressStreet,
              addressCity: employeeData.addresCity,
              addressPostal: employeeData.addressPostal,
              addressState: employeeData.addressPostal,
              isManager: employeeData.isManager,
              employeeManagerNum: employeeData.employeeManagerNum,
              status: employeeData.status,
              department: employeeData.department,
            },
            {
              where: {
                employeeNum: employeeData.employeeNum,
              },
            }
          )
        );
      })
      .catch(err => {
        reject("unable to update employee");
      });
  });
};

module.exports.addDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        for (const x in departmentData) {
          if (departmentData[x] == "") {
            departmentData[x] = null;
          }
        }
        resolve(
          Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName,
          })
        );
      })
      .catch(() => {
        reject("unable to create department");
      });
  });
};

module.exports.updateDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        for (const x in departmentData) {
          if (departmentData[x] == "") {
            departmentData[x] = null;
          }
        }
        resolve(
          Department.update(
            {
              departmentName: departmentData.departmentName,
            },
            {
              where: {
                departmentId: departmentData.departmentId,
              },
            }
          )
        );
      })
      .catch(err => {
        reject("unable to update department");
      });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Department.findAll({
            where: {
              departmentId: id,
            },
          })
        );
      })
      .catch(err => {
        reject("no results returned");
      });
  });
};

module.exports.deleteDepartmentById = function (id) {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        resolve(
          Department.destroy({
            where: {
              departmentId: id,
            },
          }).catch(err => {
            reject("department was not deleted");
          })
        );
      })
      .catch(err => {
        reject("department was not deleted");
      });
  });
};
