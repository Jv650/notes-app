"use strict";

const auth = require("basic-auth"); ///a call to the Node.js require() method to import the basic-auth module
const { User } = require("../models"); //Import the User model at the top of auth-user.js as shown below
//const { Note } = require("../models");
const bcrypt = require("bcrypt");
//var bcrypt = require("bcryptjs");

// Middleware to authenticate the request using Basic Authentication.
//exports.authenticateUser exports the middleware function so that you're able to import it from within another module.
exports.authenticatedUser = async (req, res, next) => {
  //store the message to display
  let message;
  //Parse users credentials from authorization header
  const credentials = auth(req);

  //If the user's credentials are available...
  // Attempt to retrieve the user from the data store
  // by their username (i.e. the user's "key"
  // from the Authorization header).
  if (credentials) {
    const user = await User.findOne({
      where: { emailAddress: credentials.name },
    });
    // If a user was successfully retrieved from the data store...
    // Use the bcrypt npm package to compare the user's password
    // (from the Authorization header) to the user's password
    // that was retrieved from the data store.
    if (user) {
      const authenticated = bcrypt.compareSync(
        credentials.pass, //maybe just pass
        user.password
      );
      //console.log(user.hashedPassword); //will return undefined
      // If the passwords match...
      // Store the retrieved user object on the request object
      // so any middleware functions that follow this middleware function
      // will have access to the user's information.
      if (authenticated) {
        //if passwords match
        console.log(`Authentication successful for user: ${user.userName}`);

        // Store the user on the Request object.
        req.currentUser = user;
      } else {
        message = message = `Authentication failure for user: ${user.userName}`;
      }
    } else {
      message = `User not found`;
    }
  } else {
    message = "Auth header not found";
  }

  // If user authentication failed...
  // Return a response with a 401 Unauthorized HTTP status code.
  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access Denied" });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};
