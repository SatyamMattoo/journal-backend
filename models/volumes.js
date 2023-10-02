import mongoose from "mongoose";

const volumeSchema = new mongoose.Schema({
  volumeNumber: {
    type: String,
    required: true,
  },
  publicationYear: {
    type: Number,
    required: true,
  },
  issues: [
    {
      issueNumber: {
        type: Number,
        required: true,
      },
      publicationDate: {
        type: Date,
        required: true,
      },
      articles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Article',
        },
      ],
    },
  ],
});

export const Volume = mongoose.model('Volume', volumeSchema);
