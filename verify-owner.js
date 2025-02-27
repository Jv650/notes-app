const { Note } = require("../models"); //try..models/user //require the Note model from the note model in models

//middleware to verify if it's the correct note owner (id)

exports.verifyNoteOwner = async (req, res, next) => {
  try {
    const note = await Note.findByPk(req.params.id); //await .getNote(req.params.id);
    //console.log(getCount.userId);
    //console.log()
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Verify logged in user matches the note id belonging to that user
    if (note.userId != req.currentUser.id) {
      res
        .status(403)
        .json({ message: "You're not authorized to update this note" });
    }
    // attaches note to request object so that they next guy can use it
    req.note = note;
    next();
  } catch (err) {
    next(err);
  }
};
