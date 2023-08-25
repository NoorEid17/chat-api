import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";

export default function (req: Request, res: Response, next: any) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    req.body = matchedData(req);
    return next();
  }

  res.status(400).send({ errors: result.array() });
}
