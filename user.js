"use strict";

const express = require("express");
const { User } = require("../models");
const router = express.Router(); //construct a router instance
const { authenticatedUser } = require("../middleware/userAuth");

//handler function to wrap routes and to allow proper usage of the asynchandler
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// api/user - GET
//will return all properties for the current authenticated User
//if ok will return 200 HTTP status code
router.get(
  "/",
  authenticatedUser,
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.currentUser.id, {
      attributes: { exclude: ["password"] },
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400);
      res.json({ message: "No users found" });
    }
  })
);

// api/user - POST
//will create a new user, set location header to "/"
//will return a 201 HTTP status code and no content since it is creating a user
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { userName, emailAddress, password } = req.body;
    console.log(userName, emailAddress, password);
    console.log(req.body);
    try {
      const newUser = req.body;
      await User.create(newUser);
      res.status(201).location("/").end();
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

module.exports = router;
