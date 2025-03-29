import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import paymentRoutes from "./routes/payment.routes";

export const ExpressApp = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/payment", paymentRoutes);

  app.use("/", (req: Request, res: Response, _: NextFunction) => {
    res.status(200).json({ message: "I am healthy!" });
  });
  return app;
};


