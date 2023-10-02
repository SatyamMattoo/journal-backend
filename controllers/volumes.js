import { Volume } from "../models/volumes.js";

export const allVolumes = async (req, res, next) => {
  try {
    const volumes = await Volume.find({});

    if (!volumes) return next(new ErrorHandler("No volumes found", 404));

    res.status(200).json({ success: true, volumes });
  } catch (error) {
    next(error);
  }
};
