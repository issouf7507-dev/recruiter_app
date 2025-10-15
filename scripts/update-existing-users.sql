-- Script pour marquer tous les utilisateurs existants comme devant mettre à jour leur mot de passe
-- À exécuter UNE SEULE FOIS lors de la migration

-- Mettre tous les utilisateurs existants à passwordNeedsUpdate = false
-- Cela forcera tous les utilisateurs à mettre à jour leur mot de passe
UPDATE user 
SET passwordNeedsUpdate = false 
WHERE password IS NOT NULL;

-- Afficher le résultat
SELECT 
    COUNT(*) as total_utilisateurs,
    SUM(CASE WHEN passwordNeedsUpdate = true THEN 1 ELSE 0 END) as mot_de_passe_ok,
    SUM(CASE WHEN passwordNeedsUpdate = false THEN 1 ELSE 0 END) as doit_mettre_a_jour
FROM user
WHERE password IS NOT NULL;

