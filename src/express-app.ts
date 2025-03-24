import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
// import cartRoutes from "./routes/cart.routes";
// import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import { httpLogger, HandleErrorWithLogger } from "./utils";
import { InitializeBroker } from "./service/broker.service";

export const ExpressApp = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(httpLogger);

  // await InitializeBroker();

  app.use("/payment", paymentRoutes);

  app.use("/", (req: Request, res: Response, _: NextFunction) => {
    res.status(200).json({ message: "I am healthy!" });
  });

  app.use(HandleErrorWithLogger);

  return app;
};


