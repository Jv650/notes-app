"use strict";
const express = require("express"); //import and require express
const { Note } = require("../models"); //try..models/user //require the Note model from the note model in models
const { User } = require("../models"); //require the User model from the user model in models
const { authenticatedUser } = require("../middleware/userAuth");
const { verifyNoteOwner } = require("../middleware/verify-owner");

const router = express.Router(); //construct a router instance
//const { authenticateUser } = require("../middleware/userAuth");

//handler function to wrap routes and to allow proper usage of the asynchandler
function asyncHandler(cb) {
  //callback
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// api/notes - GET
//Returns all notes including the User object associated with each note and
//200 HTTP status code
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const notes = await Note.findAll({
      attributes: ["id", "title", "content"],
      include: [
        {
          model: User,
          attributes: ["id", "userName", "emailAddress", "password"],
        },
      ],
    });
    if (notes) {
      res.status(200).json(notes);
      //console.log(notes);
    } else {
      res.status(400);
      res.json({ message: "No notes found" });
    }
  })
);

// api/notes/:id - GET
//return the corresponding note to the particular User
//200 HTTP status code
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const note = await Note.findByPk(req.params.id, {
        attributes: ["id", "title", "content"],
        include: [
          //include these attributes as well
          {
            model: User,
            attributes: ["id", "userName", "emailAddress", "password"],
          },
        ],
      });
      if (note) {
        res.json(note);
      } else {
        res.status(404).json({ message: "Note not found" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// api/notes - POST
//create a new note, and set location to the :id of the newly created note
//201 HTTP status code and no content
router.post(
  "/", //will post to the home page
  authenticatedUser,
  asyncHandler(async (req, res) => {
    try {
      const newNote = await Note.create(req.body); //var to hold the value of new note created
      res.status(201).location(`/notes/${newNote.id}`).end(); //the location of the new note eill be dynamically inserted into url
    } catch (error) {
      if (
        //catch error if sequelize validation error ot unique constraint error
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        //map the errors and return a 400 http code with errors as json
        const errors = error.errors.map((err) => err.message);
        console.log("Validation errors: ", errors);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);
// api/notes/:id - PUT
//update the corresponding note
//204 HTTP status code and no content
router.put(
  "/:id",
  authenticatedUser,
  verifyNoteOwner,
  asyncHandler(async (req, res) => {
    try {
      const note = req.note;
      note.title = req.body.title;
      note.content = req.body.content;
      await note.save(); //await since save takes time
      res.status(204).end();
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        console.log("Validation errors: ", errors);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);
// api/notes/:id - DELETE
//delete the corresponding note
//204 HTTP status code and no content
router.delete(
  "/:id",
  authenticatedUser,
  verifyNoteOwner,
  asyncHandler(async (req, res) => {
    try {
      const note = req.note;
      await note.destroy();
      res
        .status(404)
        .json({ message: `Note with id ${req.params.id} has been deleted` })
        .end();
    } catch (error) {}
  })
);

module.exports = router;
