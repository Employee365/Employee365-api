const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskTitle: {
      type: String,
      required: [true, 'A task must have a title'],
      unique: true,
    },
    taskDescription: {
      type: String,
      required: [true, 'A task must have a description'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
