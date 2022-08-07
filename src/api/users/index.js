import express from "express";
import createError from "http-errors";
import userModel from "./model.js";
import ProductModel from "../products/model.js";
import { hostOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import { generateAccessToken } from "../../auth/tools.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new userModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const me = await userModel.findById(req.user._id);
    res.send(me);
  } catch (error) {
    next(error);
  }
});

// rerturn the full list of accomodation posted by a host
userRouter.get(
  "/me/accomodations",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const me = await userModel.findById(req.user._id);
      if (me.role === "host") {
        const accomdations = await ProductModel.find({
          host: req.user._id
        });
        res.send(accomdations);
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const modifiedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true }
    );
    res.send(modifiedUser);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await userModel.findByIdAndDelete(req.user._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

userRouter.get(
  "/",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const users = await userModel.find();
      res.send(users);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

userRouter.get(
  "/:userId",

  async (req, res, next) => {
    try {
      const user = await userModel.findById(req.params.userId);
      if (user) {
        res.send(user);
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.put(
  "/:userId",

  async (req, res, next) => {
    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.delete(
  "/:userId",

  async (req, res, next) => {
    try {
      const deletedUser = await userModel.findByIdAndDelete(req.params.userId);
      if (deletedUser) {
        res.send({ message: "User deleted successfully!" });
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.checkCredentials(email, password);

    if (user) {
      const accessToken = await generateAccessToken({
        _id: user._id,
        role: user.role
      });
      res.send({ accessToken });
    } else {
      next(createError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

export default userRouter;
