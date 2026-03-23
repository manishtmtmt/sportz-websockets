import { z } from "zod";

// Helper function for ISO date string validation
export const isoDateString = (fieldName = "Date") => {
  return z.string().datetime({
    message: `${fieldName} must be a valid ISO-8601 datetime`,
    offset: true,
  });
};

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

// Schema for validating list matches query parameters
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Schema for validating match ID parameter
export const matchIdParamSchema = z.object({
  id: z.uuid(),
});

// Schema for creating a new match
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    startTime: isoDateString("Start time"),
    endTime: isoDateString("End time"),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

// Schema for updating match scores
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
