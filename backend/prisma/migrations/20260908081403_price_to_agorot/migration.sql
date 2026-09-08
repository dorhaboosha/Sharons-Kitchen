-- Store price in agorot (integer, 1/100 shekel) instead of whole shekels.
-- Add the new column, backfill from the old one, enforce NOT NULL, then drop the old column.

ALTER TABLE "dishes" ADD COLUMN "price_agorot" INTEGER;

UPDATE "dishes" SET "price_agorot" = "price" * 100;

ALTER TABLE "dishes" ALTER COLUMN "price_agorot" SET NOT NULL;

ALTER TABLE "dishes" DROP COLUMN "price";
