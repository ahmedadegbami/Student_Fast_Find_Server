import express from "express";
import createError from "http-errors";
import productModel from "./model.js";
import { hostOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import { generateAccessToken } from "../../auth/tools.js";

const productRouter = express.Router();

productRouter.post(
  "/",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const newProduct = new productModel(req.body);
      const { _id } = await newProduct.save();
      res.status(201).send({ _id });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await productModel.find();
    res.send(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.get(
  "/:productId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const product = await productModel.findById(req.params.productId);
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
  }
);

productRouter.put(
  "/:productId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(
        req.params.ProductId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedProduct) {
        res.send(updatedProduct);
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

productRouter.delete(
  "/:productId",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedProduct = await productModel.findByIdAndDelete(
        req.params.ProductId
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
