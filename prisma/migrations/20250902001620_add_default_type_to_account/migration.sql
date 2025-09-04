/*
  Warnings:

  - The `emailVerified` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `account` MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'credential';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailVerified`,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `type` ENUM('CANDIDAT', 'RECRUTEUR', 'COLLABORATEUR') NULL;
