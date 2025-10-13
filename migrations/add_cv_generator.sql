-- Migration pour ajouter le générateur de CV

-- Créer la table des templates de CV
CREATE TABLE IF NOT EXISTS `CVTemplate` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `layout` VARCHAR(191) NOT NULL,
  `colors` JSON NULL,
  `fonts` JSON NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table principale des CV
CREATE TABLE IF NOT EXISTS `CV` (
  `id` VARCHAR(191) NOT NULL,
  `candidatId` VARCHAR(191) NOT NULL,
  `templateId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL DEFAULT 'Mon CV',
  `isPublic` BOOLEAN NOT NULL DEFAULT false,
  `lastExportedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `CV_candidatId_idx` (`candidatId`),
  INDEX `CV_templateId_idx` (`templateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des informations personnelles du CV
CREATE TABLE IF NOT EXISTS `CVPersonalInfo` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NULL,
  `lastName` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `dateOfBirth` DATETIME(3) NULL,
  `nationality` VARCHAR(191) NULL,
  `maritalStatus` VARCHAR(191) NULL,
  `drivingLicense` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `linkedin` VARCHAR(191) NULL,
  `github` VARCHAR(191) NULL,
  `portfolio` VARCHAR(191) NULL,
  `profileImage` VARCHAR(191) NULL,
  `summary` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CVPersonalInfo_cvId_key` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des expériences du CV
CREATE TABLE IF NOT EXISTS `CVExperience` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `position` VARCHAR(191) NOT NULL,
  `company` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NULL,
  `contractType` VARCHAR(191) NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NULL,
  `isCurrent` BOOLEAN NOT NULL DEFAULT false,
  `description` TEXT NULL,
  `achievements` TEXT NULL,
  `skills` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `CVExperience_cvId_idx` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des formations du CV
CREATE TABLE IF NOT EXISTS `CVEducation` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `degree` VARCHAR(191) NOT NULL,
  `institution` VARCHAR(191) NOT NULL,
  `field` VARCHAR(191) NULL,
  `location` VARCHAR(191) NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NULL,
  `isCurrent` BOOLEAN NOT NULL DEFAULT false,
  `description` TEXT NULL,
  `grade` VARCHAR(191) NULL,
  `honors` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `CVEducation_cvId_idx` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des compétences du CV
CREATE TABLE IF NOT EXISTS `CVSkill` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `level` INTEGER NOT NULL DEFAULT 1,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `CVSkill_cvId_idx` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des langues du CV
CREATE TABLE IF NOT EXISTS `CVLanguage` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `level` VARCHAR(191) NOT NULL,
  `certification` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `CVLanguage_cvId_idx` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des centres d'intérêt du CV
CREATE TABLE IF NOT EXISTS `CVInterest` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `CVInterest_cvId_idx` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer la table des sections personnalisées du CV
CREATE TABLE IF NOT EXISTS `CVCustomSection` (
  `id` VARCHAR(191) NOT NULL,
  `cvId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `CVCustomSection_cvId_idx` (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ajouter les contraintes de clés étrangères
ALTER TABLE `CV` ADD CONSTRAINT `CV_candidatId_fkey` FOREIGN KEY (`candidatId`) REFERENCES `Candidat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CV` ADD CONSTRAINT `CV_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CVTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CVPersonalInfo` ADD CONSTRAINT `CVPersonalInfo_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CVExperience` ADD CONSTRAINT `CVExperience_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CVEducation` ADD CONSTRAINT `CVEducation_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CVSkill` ADD CONSTRAINT `CVSkill_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CVLanguage` ADD CONSTRAINT `CVLanguage_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CVInterest` ADD CONSTRAINT `CVInterest_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CVCustomSection` ADD CONSTRAINT `CVCustomSection_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Insérer les templates par défaut
INSERT INTO `CVTemplate` (`id`, `name`, `description`, `layout`, `colors`, `fonts`, `isActive`, `createdAt`, `updatedAt`) VALUES
('template_modern', 'Moderne', 'Design épuré et contemporain', 'modern', '{"primary": "#3B82F6", "secondary": "#64748B", "accent": "#F1F5F9"}', '{"heading": "Inter", "body": "Inter"}', true, NOW(), NOW()),
('template_classic', 'Classique', 'Style traditionnel et professionnel', 'classic', '{"primary": "#1F2937", "secondary": "#6B7280", "accent": "#F9FAFB"}', '{"heading": "Times New Roman", "body": "Times New Roman"}', true, NOW(), NOW()),
('template_creative', 'Créatif', 'Design original et coloré', 'creative', '{"primary": "#7C3AED", "secondary": "#A78BFA", "accent": "#F3F4F6"}', '{"heading": "Poppins", "body": "Poppins"}', true, NOW(), NOW()),
('template_minimal', 'Minimaliste', 'Simplicité et élégance', 'minimal', '{"primary": "#059669", "secondary": "#10B981", "accent": "#ECFDF5"}', '{"heading": "Helvetica", "body": "Helvetica"}', true, NOW(), NOW());
