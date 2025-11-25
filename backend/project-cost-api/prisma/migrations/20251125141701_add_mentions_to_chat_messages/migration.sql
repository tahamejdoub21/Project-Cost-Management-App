-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[];
