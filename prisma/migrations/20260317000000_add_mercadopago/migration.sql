-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MERCADOPAGO';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "mercadopago_id" TEXT;

-- CreateTable
CREATE TABLE "mercadopago_config" (
    "id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "webhook_secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_sandbox" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercadopago_config_pkey" PRIMARY KEY ("id")
);
