const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
let Schema = mongoose.Schema;

var userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
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
      bcrypt
        .genSalt(10) // Generate a "salt" using 10 rounds
        .then(salt => bcrypt.hash(userData.password, salt)) // encrypt the password: "myPassword123"
        .then(hash => {
          // TODO: Store the resulting "hash" value in the DB
          userData.password = hash;
          let newUser = User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch(err => {
              if (err.code == 11000) reject("user name already taken");
              else if (err.code != 11000)
                reject(`There was an error creating the user: ${err}`);
            });
        })
        .catch(err => {
          reject("There was an error encrypting the password!"); // Show any errors that occurred during the process
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
        }

        bcrypt.compare(userData.password, users[0].password).then(result => {
          if (result === true) {
            users[0].loginHistory.push({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent,
            });

            User.updateOne(
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
          } else {
            reject(`Incorrect Password for user: ${userData.userName}`);
          }
        });
      })
      .catch(err => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
