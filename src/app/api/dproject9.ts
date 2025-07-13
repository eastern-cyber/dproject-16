import { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await query("SELECT * FROM \"DProject-9\"");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

