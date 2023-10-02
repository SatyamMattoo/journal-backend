import crypto from "crypto";
import nodemailer from "nodemailer";

class UserClass {
  constructor(userModel) {
    this.userModel = userModel;
  }

  generatePasswordResetToken() {
    // Generate a random token
    const token = crypto.randomBytes(20).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Set the token and its expiration time
    this.userModel.resetPasswordToken = tokenHash;

    // Set the expiration time (e.g., 1 hour from now)
    const expirationMs = 60 * 60 * 1000;
    this.userModel.resetPasswordExpire = new Date().getTime() + expirationMs;

    // Return the generated token
    return { token, tokenHash };
  }

  isPasswordResetTokenExpired() {
    if (!this.userModel.resetPasswordExpire) {
      return true; // Token has not been set
    }
    const currentTime = new Date().getTime();
    return currentTime > this.userModel.resetPasswordExpire;
  }

  async sendPasswordResetEmail(req, token) {
    // Check if the user has a valid email address
    if (!this.userModel.email) {
      throw new Error("User has no valid email address.");
    }

    // Create a nodemailer transporter (replace with your email service details)
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMPT_MAIL, // replace with your email
        pass: process.env.SMPT_PASSWORD, // replace with your email password
      },
    });

    // Define the email message
    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: this.userModel.email,
      subject: "Password Reset for HPU Journal",
      text: `Hello,\nYou have requested to reset your password for your HPU account. 
      Please click the following link to reset your password:\n${process.env.FRONTEND_URL}/password/reset/${token}\n\n
      If you did not request this password reset, please disregard this email. 
      Your password will remain unchanged.\n
      Thank you,\nHPU,Shimla`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  }
}

export { UserClass };
