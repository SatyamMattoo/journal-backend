import ErrorHandler from "../middlewares/errorHandler.js";
import { Articles } from "../models/articles.js";
import { User } from "../models/users.js";
import { Volume } from "../models/volumes.js";
import { storage } from "../utils/gcs.js";
import { sendMail } from "../utils/mails.js";

//Logged in user
export const createArticle = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Check if a file was uploaded
    if (!req.file)
      return next(new ErrorHandler("Please upload a doc or pdf file", 400));

    // Upload the file to Google Cloud Storage
    const bucket = storage.bucket("hpujournal"); // Replace with your bucket name
    const blob = bucket.file(`pdf/${Date.now()}-${req.file.originalname}`);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.error("Error uploading file to Google Cloud Storage:", err);
      return next(err);
    });

    blobStream.on("finish", async () => {
      try {
        // The file has been successfully uploaded to Google Cloud Storage
        // Generate the Google Cloud Storage URL
        const gcsUrl = `${process.env.GCS_URL}/${blob.name}`;

        // https://storage.googleapis.com/hpujournal
        // Create a new article instance
        const newArticle = new Articles({
          title,
          description,
          pdfFile: gcsUrl, // Set the Google Cloud Storage URL
          author: req.user.id, // Set the author to the user's ID
          status: "submitted", // You can set the default status here
        });

        // Save the article to the database
        await newArticle.save();

        // Send an email to the user with the article ID
        const emailSubject = "Article Submission Confirmation";
        const emailMessage = `Your article has been successfully submitted. Your article ID is: ${newArticle._id}. You can use this ID to track your article's status later.`;

        await sendMail(req.user.email, emailSubject, emailMessage);

        // Respond with a success message or the newly created article
        res.status(201).json({
          message: "Article submitted successfully",
          article: newArticle,
        });
      } catch (error) {
        console.error("Error creating article:", error);
        next(error);
      }
    });

    // Pipe the uploaded file data into the Google Cloud Storage stream
    blobStream.end(req.file.buffer);
  } catch (error) {
    // Handle errors
    console.error("Error uploading file to Google Cloud Storage:", error);
    next(error);
  }
};

// When the admin decides to publish the article
export const publishArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    let article = await Articles.findById(id);

    if (article.status !== "readytopublish")
      return next(new ErrorHandler("Article not ready to publish", 404));

    if (!article) return next(new ErrorHandler("Article not found", 404));

    // Find the article by ID and update its status to "published"
    article = await Articles.findByIdAndUpdate(
      id,
      { status: "published" },
      { new: true }
    );

    // Determine the publication date from the article's creation date
    const publicationDate = article.createdAt;
    const publicationYear = publicationDate.getFullYear();

    // Calculate volume and issue numbers based on the publication date
    let volumeNumber = publicationYear - 2023 + 1; // Start volume number from 1 in 2022
    let issueNumber = publicationDate.getMonth() < 6 ? 1 : 2;

    // Check if a volume with the calculated volume number already exists
    const existingVolume = await Volume.findOne({ volumeNumber });

    // If it doesn't exist, create it
    if (!existingVolume) {
      const newVolume = new Volume({
        volumeNumber,
        publicationYear,
        issues: [
          {
            issueNumber,
            publicationDate,
            articles: [article._id], // Initialize with the current article
          },
        ],
      });
      await newVolume.save();
    } else {
      // If the volume already exists, find the issue with the same issue number or create a new issue
      const existingIssue = existingVolume.issues.find(
        (issue) => issue.issueNumber === issueNumber
      );
      if (existingIssue) {
        existingIssue.publicationDate = publicationDate; // Update the publication date
        existingIssue.articles.push(article._id); // Add the article to the existing issue
      } else {
        existingVolume.issues.push({
          issueNumber,
          publicationDate,
          articles: [article._id], // Initialize with the current article
        });
      }
      await existingVolume.save();
    }

    // Respond with a success message or the updated article
    res.status(200).json({
      message: "Article published successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

//All users
export const publishedArticles = async (req, res, next) => {
  try {
    const articles = await Articles.find({ status: "published" }).populate(
      "author",
      "name email"
    );

    res.status(200).json({ success: true, articles });
  } catch (error) {
    next(error);
  }
};

//Admin
export const submittedArticles = async (req, res, next) => {
  try {
    const articles = await Articles.find({ status: "submitted" }).populate(
      "author",
      "name email"
    );

    if (!articles) return next(new ErrorHandler("No articles found", 404));

    res.status(200).json({ success: true, articles });
  } catch (error) {
    next(error);
  }
};

//Users- all articles in a particlular issue
export const getArticlesForIssue = async (req, res, next) => {
  try {
    const { volumeNumber, issueNumber } = req.params;

    // Find the volume based on volume number (assuming volumeNumber is a string)
    const volume = await Volume.findOne({ volumeNumber });

    if (!volume) {
      return next(new ErrorHandler(`Volume ${volumeNumber} not found`, 404));
    }

    // Find the issue within the volume based on issue number
    const issue = volume.issues.find(
      (issue) => issue.issueNumber === parseInt(issueNumber)
    );

    if (!issue) {
      return next(
        new ErrorHandler(
          `Issue ${issueNumber} not found in Volume ${volumeNumber}`,
          404
        )
      );
    }

    // Get the article IDs from the issue
    const articleIds = issue.articles;

    // Fetch article details based on IDs
    const articles = await Articles.find({ _id: { $in: articleIds } }).select(
      "title description pdfFile"
    );

    res.status(200).json({ success: true, articles });
  } catch (error) {
    next(error);
  }
};

//Author
export const trackProgress = async (req, res, next) => {
  try {
    const { id } = req.body; // Change req.body to req.query to receive the ID as a query parameter
    const userId = req.user._id; // Assuming your authentication middleware sets req.user

    // Use findOne to find a single article matching both conditions
    const article = await Articles.findOne({
      _id: id,
      author: userId,
    });

    if (!article) {
      return next(
        new ErrorHandler(
          "Article with the given ID not found or you are not the author",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      status: article.status,
    });
  } catch (error) {
    next(error);
  }
};

//Admin
export const assignArticleToEditor = async (req, res, next) => {
  try {
    const { articleId, editorId } = req.params;

    // Check if the article and editor exist in the database
    const article = await Articles.findById(articleId);
    const editor = await User.findById(editorId);

    if (!article) {
      return next(new ErrorHandler("Article not found", 404));
    }
    if (!editor) {
      return next(new ErrorHandler("Editor not found", 404));
    }

    if (article.editor) {
      return next(new ErrorHandler("Article already assigned", 404));
    }
    // Assign the article to the editor by updating the editor field
    article.editor = editorId;

    // Update the article status to "underreview"
    article.status = "underreview";

    await article.save();

    const emailSubject = "New Article Assigned";
    const emailMessage = `A new article "${article.title}" has been assigned to you.Please check the dashboard and review the article as soon as possible.\nThankyou\n\n HPU E-Journal`;

    await sendMail(editor.email, emailSubject, emailMessage);

    res.status(200).json({
      success: true,
      message: `Article assigned to editor ${editor.name} and status changed to underreview`,
    });
  } catch (error) {
    next(error);
  }
};

//Admin
export const readyToPublish = async (req, res, next) => {
  const articles = await Articles.find({ status: "readytopublish" });

  if (!articles)
    return res.json({
      message: "No articles to publish",
    });

  res.status(200).json({
    success: true,
    articles,
  });
};

//for all users
export const getEditors = async (req, res, next) => {
  const editors = await User.find({ role: "editor" });

  if (!editors)
    return res.json({
      message: "No Editors found",
    });

  res.status(200).json({
    success: true,
    editors,
  });
};

//Editor
export const getAssignedArticles = async (req, res, next) => {
  try {
    const editorId = req.user.id; // Get the editor's ID from the authenticated user

    // Find all articles assigned to the editor based on their ID
    const assignedArticles = await Articles.find({
      editor: editorId,
      status: "underreview",
    });

    // Respond with the list of assigned articles
    res.status(200).json({
      success: true,
      assignedArticles,
    });
  } catch (error) {
    next(error);
  }
};

//Editor
export const resubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Find the article by ID
    const article = await Articles.findById(id);

    if (!article) {
      return next(new ErrorHandler("Article not found", 404));
    }

    // Check if the editor sending the article is the assigned editor
    if (article.editor.toString() !== req.user.id) {
      return next(
        new ErrorHandler(
          "You are not the assigned editor for this article",
          403
        )
      );
    }

    // Check if the article status allows sending for resubmission
    if (article.status !== "underreview") {
      return next(
        new ErrorHandler(
          "Article cannot be sent for resubmission in its current status",
          400
        )
      );
    }

    // Update the article status
    article.status = "resubmission";

    // Save the updated article
    await article.save();

    // Notify the user via email about the resubmission
    const user = await User.findById(article.author);
    const emailSubject = "Article Resubmission";
    const emailMessage = `Your article titled "${article.title}" has been sent for resubmission with the following details:\n\nIssue:  ${title}\n\nDescription: ${description}\n\nPlease resubmit your article with necessary changes for furthur consideration.\nThankyou\n\n HPU E-Journal`;

    await sendMail(user.email, emailSubject, emailMessage);

    res
      .status(200)
      .json({ success: true, message: "Article sent for resubmission" });
  } catch (error) {
    next(error);
  }
};

export const sendToPublish = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the article by ID
    const article = await Articles.findById(id);

    if (!article) {
      return next(new ErrorHandler("Article not found", 404));
    }

    // Check if the editor sending the article is the assigned editor
    if (article.editor.toString() !== req.user.id) {
      return next(
        new ErrorHandler(
          "You are not the assigned editor for this article",
          403
        )
      );
    }

    // Check if the article status allows sending for publication
    if (article.status !== "underreview") {
      return next(
        new ErrorHandler(
          "Article cannot be sent for publication in its current status",
          400
        )
      );
    }

    // Update the article status to "readytopublish"
    article.status = "readytopublish";

    // Save the updated article
    await article.save();

    // Notify the admin via email about the article ready for publication
    const admin = await User.findOne({ role: "admin" }); // You need to implement logic to find the admin user

    if (!admin) {
      return next(new ErrorHandler("Admin not found", 404));
    }

    const emailSubject = "Article Ready for Publication";
    const emailMessage = `The article titled "${article.title}" is ready for publication. Please review and proceed with publication.`;

    await sendMail(admin.email, emailSubject, emailMessage);

    res.status(200).json({
      success: true,
      message: "Article marked as ready for publication",
    });
  } catch (error) {
    next(error);
  }
};
