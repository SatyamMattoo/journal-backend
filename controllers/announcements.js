import ErrorHandler from "../middlewares/errorHandler.js";
import { Announcement } from "../models/announcements.js";

export const getAllAnnouncements = async (req, res, next) => {
  try {
    // Fetch all announcements from the database
    const announcements = await Announcement.find().sort({ createdAt: -1 });

    // Respond with the list of announcements
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    // Get data from the request body
    const { title, description } = req.body;

    // Use the create function to create and save the new announcement
    const announcement = await Announcement.create({
      title,
      description,
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return next(new ErrorHandler("Announcement not found", 404));
    }

    await Announcement.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
