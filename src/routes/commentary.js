import { desc, eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/db.js";
import { commentaryTable } from "../db/schema.js";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";

export const commentaryRouter = Router({ mergeParams: true });

// GET /api/v1/matches/:id/commentary
commentaryRouter.get("/", async (req, res) => {
  try {
    // Validate matchId param
    const paramResult = matchIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid match id", details: paramResult.error.issues });
    }
    const { id: matchId } = paramResult.data;

    // Validate query
    const queryResult = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid query", details: queryResult.error.issues });
    }
    const { limit = 100 } = queryResult.data;
    const MAX_LIMIT = 100;
    const safeLimit = Math.min(Number(limit) || 100, MAX_LIMIT);

    // Fetch commentary for the match, newest first
    const commentary = await db
      .select()
      .from(commentaryTable)
      .where(eq(commentaryTable.matchId, matchId))
      .orderBy(desc(commentaryTable.createdAt))
      .limit(safeLimit);

    res.status(200).json({ data: commentary });
  } catch (err) {
    console.error("Failed to fetch commentary:", err);
    res.status(500).json({ error: "Failed to fetch commentary" });
  }
});

// POST /api/v1/matches/:id/commentary
commentaryRouter.post("/", async (req, res) => {
  try {
    // Validate matchId param
    const paramResult = matchIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid match id", details: paramResult.error.issues });
    }
    const { id: matchId } = paramResult.data;

    // Validate body
    const bodyResult = createCommentarySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: "Invalid commentary data",
        details: bodyResult.error.issues,
      });
    }
    const commentaryData = bodyResult.data;

    // Insert into commentary table
    const [inserted] = await db
      .insert(commentaryTable)
      .values({ ...commentaryData, matchId })
      .returning();

    res.status(201).json({ data: inserted });
  } catch (err) {
    console.error("Failed to create commentary:", err);
    res.status(500).json({ error: "Failed to create commentary" });
  }
});
