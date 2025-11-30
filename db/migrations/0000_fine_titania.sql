CREATE TABLE "files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"path" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'file' NOT NULL,
	"permissions" text DEFAULT '-rw-r--r--' NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_path_unique" UNIQUE("path")
);
