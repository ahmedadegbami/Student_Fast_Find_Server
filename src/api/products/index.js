import express from "express";
import createError from "http-errors";
import productModel from "./model.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import userModel from "../users/model.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const productRouter = express.Router();

// const cloudinaryUploader = multer({
//   storage: new CloudinaryStorage({
//     cloudinary,
//     params: {
//       folder: "products"
//     }
//   }),
//   fileFilter: (req, file, multerNext) => {
//     if (file.mimetype !== "image/jpeg") {
//       multerNext(createError(400, "Only jpeg allowed!"));
//     } else {
//       multerNext(null, true);
//     }
//   },
//   limits: { fileSize: 1 * 1024 * 1024 } // file size
// }).single("imageUrl");

productRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newProduct = new productModel(req.body);
    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await productModel.find().populate({
      path: "poster",
      select: "username"
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.productId).populate({
      path: "poster",
      select: "username"
    });
    if (product) {
      res.send(product);
    } else {
      next(
        createError(404, `product with id ${req.params.productId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.get(
  "/me/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user._id);
      if (user) {
        const product = await productModel.findById(req.params.productId);
        if (product) {
          if (product.poster.toString().split(" ")[0] === req.user._id) {
            res.send(product);
          } else {
            next(createError(403, "Not authorized"));
          }
        } else {
          next(
            createError(
              404,
              `product with id ${req.params.productId} not found!`
            )
          );
        }
      } else {
        next(createError(404, `user with id ${req.user._id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

// productRouter.put("/:productId", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     const user = await userModel.findById(req.user._id);
//     if (user) {
//       const product = await productModel.findById(req.params.productId);
//       if (product) {
//         if (product.poster.toString().split(" ")[0] === req.user._id) {
//           const updatedProduct = await productModel.findByIdAndUpdate(
//             req.params.productId,
//             req.body,
//             { new: true }
//           );
//           res.send(updatedProduct);
//         } else {
//           next(createError(403, "Not authorized"));
//         }
//       } else {
//         next(
//           createError(404, `product with id ${req.params.productId} not found!`)
//         );
//       }
//     } else {
//       next(createError(404, `user with id ${req.user._id} not found!`));
//     }
//   } catch (error) {
//     next(error);
//   }
// });

productRouter.put("/:productId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (product) {
      const updatedProduct = await productModel.findByIdAndUpdate(
        req.params.productId,
        req.body,
        { new: true }
      );
      res.send(updatedProduct);
    } else {
      next(
        createError(404, `product with id ${req.params.productId} not found!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.delete(
  "/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const deletedProduct = await productModel.findByIdAndDelete(
        req.params.productId
      );
      if (deletedProduct) {
        res.send(deletedProduct);
      } else {
        next(
          createError(404, `Product with id ${req.params.productId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productRouter;
