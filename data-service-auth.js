const mongoose = require("mongoose");
let Schema = mongoose.Schema;

var userSchema = new Schema({
  user: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{ datetime: Date, userAgent: String }],
});

let User;

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://dbUser:xxandrexx30@senecaweb.m3l1u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    );
    db.on("error", err => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      console.log("Successfully opened Database");
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password == userData.password2) {
      let newUser = new User(userData);
      newUser.save(function (err) {
        if (err) {
          if (err.code == 11000) {
            reject("User Name already taken");
          } else {
            reject("There was an error creating the user: " + err);
          }
        } else {
          resolve();
        }
      });
    } else {
      reject("Passwords do not match");
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .exec()
      .then(users => {
        if (users.length == 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else if (users[0].password !== userData.password) {
          reject(`Incorrect Password for user: ${userData.userName}`);
        } else if (users[0].password == userData.password) {
          users[0].loginHistory.push({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
          });
          User.update(
            { userName: users[0].userName },
            { $set: { loginHistory: users[0].loginHistory } },
            { multi: false }
          )
            .exec()
            .then(() => {
              resolve(users[0]);
            })
            .catch(err => {
              reject(`There was an error verifying the user: ${err}`);
            });
        }
      })
      .catch(err => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
