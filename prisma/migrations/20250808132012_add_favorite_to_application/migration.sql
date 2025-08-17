/*
  Warnings:

  - You are about to drop the column `favorite` on the `Candidat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Application` ADD COLUMN `favorite` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Candidat` DROP COLUMN `favorite`;

-- AlterTable
ALTER TABLE `JobOffer` MODIFY `description` TEXT NOT NULL,
    MODIFY `benefits` TEXT NOT NULL,
    MODIFY `requirements` TEXT NOT NULL,
    MODIFY `responsibilities` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `jobOfferId` INTEGER NOT NULL,
    `candidatId` VARCHAR(191) NOT NULL,
    `recruteurId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversation_jobOfferId_candidatId_recruteurId_key`(`jobOfferId`, `candidatId`, `recruteurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `senderType` ENUM('CANDIDAT', 'RECRUTEUR') NOT NULL,
    `content` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_jobOfferId_fkey` FOREIGN KEY (`jobOfferId`) REFERENCES `JobOffer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_candidatId_fkey` FOREIGN KEY (`candidatId`) REFERENCES `Candidat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_recruteurId_fkey` FOREIGN KEY (`recruteurId`) REFERENCES `Recruteur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
