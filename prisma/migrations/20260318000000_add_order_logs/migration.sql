-- CreateTable
CREATE TABLE "order_logs" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_logs_order_id_idx" ON "order_logs"("order_id");

-- AddForeignKey
ALTER TABLE "order_logs" ADD CONSTRAINT "order_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
