import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// Define match status enum
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

// Matches table - stores sports match information
export const matchesTable = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  sport: text("sport").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  status: matchStatusEnum("status").notNull().default("scheduled"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Commentary table - stores real-time match commentary and events
export const commentaryTable = pgTable("commentary", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .references(() => matchesTable.id, { onDelete: "cascade" })
    .notNull(),
  minute: integer("minute"),
  sequence: integer("sequence").notNull(),
  period: text("period"), // e.g., "first_half", "second_half", "overtime", etc.
  eventType: text("event_type").notNull(), // e.g., "goal", "card", "substitution", "commentary"
  actor: text("actor"), // player name or referee
  team: text("team"), // which team the event relates to
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // additional structured data about the event
  tags: text("tags").array(), // searchable tags for the event
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
