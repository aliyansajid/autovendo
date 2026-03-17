/*
  Warnings:

  - You are about to drop the column `address` on the `dealer` table. All the data in the column will be lost.
  - Added the required column `streetAddress` to the `dealer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dealer" DROP COLUMN "address",
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Switzerland',
ADD COLUMN     "streetAddress" TEXT NOT NULL;
