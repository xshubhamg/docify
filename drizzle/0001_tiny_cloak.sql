CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"author" text NOT NULL,
	"voice_id" text NOT NULL,
	"file_url" text NOT NULL,
	"file_blob_key" text NOT NULL,
	"cover_url" text,
	"cover_blob_key" text,
	"file_size" integer NOT NULL,
	"mime_type" text DEFAULT 'application/pdf' NOT NULL,
	"total_segments" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_segment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_id" text NOT NULL,
	"content" text NOT NULL,
	"segment_index" integer NOT NULL,
	"page_number" integer,
	"word_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_id" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"billing_period_start" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_segment" ADD CONSTRAINT "document_segment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_segment" ADD CONSTRAINT "document_segment_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_session" ADD CONSTRAINT "voice_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_session" ADD CONSTRAINT "voice_session_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_user_id_idx" ON "document" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_slug_key" ON "document" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "document_segment_user_id_idx" ON "document_segment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_segment_document_id_idx" ON "document_segment" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_segment_document_segment_idx_key" ON "document_segment" USING btree ("document_id","segment_index");--> statement-breakpoint
CREATE INDEX "voice_session_user_id_idx" ON "voice_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "voice_session_document_id_idx" ON "voice_session" USING btree ("document_id");