import jwt from "jsonwebtoken";

export const setCookie = (res, user, message, statusCode = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.NODE_JWT_SECRET);

  const { name, email, role } = user;

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      token,
      name,
      email,
      role,
      message,
    });
};
