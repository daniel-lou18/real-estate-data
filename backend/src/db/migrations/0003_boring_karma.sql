CREATE EXTENSION postgis;
CREATE TYPE "public"."property_type_label" AS ENUM('ACTIVITE', 'APPARTEMENT INDETERMINE', 'BATI - INDETERMINE : Vefa sans descriptif', 'BATI - INDETERMINE : Vente avec volume(s)', 'BATI MIXTE - LOGEMENT/ACTIVITE', 'BATI MIXTE - LOGEMENTS', 'DES DEPENDANCES', 'DES MAISONS', 'DEUX APPARTEMENTS', 'MAISON - INDETERMINEE', 'TERRAIN ARTIFICIALISE MIXTE', 'TERRAIN D''AGREMENT', 'TERRAIN DE TYPE RESEAU', 'TERRAIN DE TYPE TAB', 'UN APPARTEMENT', 'UNE DEPENDANCE', 'UNE MAISON');--> statement-breakpoint
CREATE TABLE "communes_geom" (
	"insee_code" varchar(5) PRIMARY KEY NOT NULL,
	"name" text,
	"geom" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sections_geom" (
	"section" varchar(11) PRIMARY KEY NOT NULL,
	"insee_code" varchar(5),
	"prefix" varchar(3),
	"code" varchar(2),
	"geom" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sections_geom" ADD CONSTRAINT "sections_geom_insee_code_communes_geom_insee_code_fk" FOREIGN KEY ("insee_code") REFERENCES "public"."communes_geom"("insee_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_communes_geom_geom_gist" ON "communes_geom" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "idx_sections_geom_insee_code" ON "sections_geom" USING btree ("insee_code");--> statement-breakpoint
CREATE INDEX "idx_sections_geom_geom_gist" ON "sections_geom" USING gist ("geom");--> statement-breakpoint
