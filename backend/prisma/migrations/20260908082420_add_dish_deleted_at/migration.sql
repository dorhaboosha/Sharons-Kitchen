-- Track when a dish was soft-deleted (isActive -> false); NULL while active.

ALTER TABLE "dishes" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Best-effort backfill for dishes that are already inactive.
UPDATE "dishes" SET "deleted_at" = "updated_at" WHERE "is_active" = false;
