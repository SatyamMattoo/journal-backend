import nodemailer from "nodemailer";

export const sendMail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure: true,
      auth: {
        user: process.env.SMPT_MAIL, // replace with your email
        pass: process.env.SMPT_PASSWORD, // replace with your email password
      },
    });

    // Define the email message
    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: email,
      subject,
      text: message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


