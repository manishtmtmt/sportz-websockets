import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matchesTable } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: JSON.stringify(parsed.error),
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matchesTable)
      .orderBy(desc(matchesTable.createdAt))
      .limit(limit);

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return res.status(500).json({
      error: "Failed to fetch matches",
    });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: JSON.stringify(parsed.error),
    });
  }

  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;

  try {
    const [event] = await db
      .insert(matchesTable)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    if (typeof res.app.locals.broadcastMatchCreated === "function") {
      try {
        res.app.locals.broadcastMatchCreated(event);
      } catch (broadcastError) {
        console.error("Failed to broadcast match creation:", broadcastError);
      }
    }

    res.status(201).json({ data: event });
  } catch (error) {
    console.error("Failed to create match:", error);
    return res.status(500).json({
      error: "Failed to create match",
    });
  }
});
