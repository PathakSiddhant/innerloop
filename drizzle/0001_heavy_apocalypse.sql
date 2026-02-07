CREATE TABLE "dev_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid,
	"date" text NOT NULL,
	"tasks_completed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blockers" text,
	"energy_level" integer,
	"commit_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entertainment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"genre" text NOT NULL,
	"platform" text,
	"language" text,
	"image" text,
	"status" text DEFAULT 'to_watch' NOT NULL,
	"current_season" integer DEFAULT 1,
	"current_episode" integer DEFAULT 0,
	"total_seasons" integer,
	"total_episodes" integer,
	"rating" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"is_rest_day" boolean DEFAULT false NOT NULL,
	"water_goal" integer DEFAULT 3000 NOT NULL,
	"water_intake" integer DEFAULT 0 NOT NULL,
	"step_goal" integer DEFAULT 10000 NOT NULL,
	"step_count" integer DEFAULT 0 NOT NULL,
	"body_weight" real,
	"target_weight" real DEFAULT 75,
	"sessions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"macro_goal" jsonb DEFAULT '{"cals":2500,"p":180,"c":250,"f":70}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"problem" text NOT NULL,
	"is_validated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"url" text,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"vision" text,
	"status" text DEFAULT 'building',
	"tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"complexity_score" integer DEFAULT 1,
	"revenue_potential" integer DEFAULT 0,
	"ai_blueprint" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sports_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"sport" text NOT NULL,
	"title" text NOT NULL,
	"tournament" text,
	"platform" text,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"duration" integer DEFAULT 180,
	"ai_intel" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'work',
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"task_type" text DEFAULT 'flexible',
	"start_time" text,
	"duration" integer DEFAULT 30,
	"energy" text DEFAULT 'medium',
	"date" text NOT NULL,
	"skipped_reason" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vault" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"category" text DEFAULT 'General',
	"tags" text,
	"description" text,
	"source" text,
	"importance" text DEFAULT 'medium',
	"is_favorite" boolean DEFAULT false,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "daily_logs" CASCADE;--> statement-breakpoint
ALTER TABLE "dev_logs" ADD CONSTRAINT "dev_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "persona_mode";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "focus_area";