DROP VIEW IF EXISTS `vFarmCity`;

CREATE VIEW vFarmCity AS
SELECT f.Name, a.City
FROM `Farm` AS f
INNER JOIN `Farm-Address` AS fa ON fa.id_Farm = f.id
INNER JOIN `Address` AS a ON a.id = fa.id_Address

DROP VIEW IF EXISTS `vFields`;

CREATE VIEW vFields AS
SELECT ff.FieldNumber, ff.FieldName, ff.Acreage, ff.FieldLocation
FROM `Farm` f
INNER JOIN `FarmField` ff ON ff.id_Farm = f.id

DROP VIEW IF EXISTS `vFarmRegistration`;

CREATE VIEW vFarmRegistration AS
SELECT u.id AS `id_User`, u.FirstName, u.LastName, u.Handle, u.DateRegistered, f.id AS `id_Farm`, f.Name AS `FarmName`, f.TotalAcreage, a.PostalCode, fb.crop, fb.livestock
FROM `User` u
LEFT JOIN `Farm` f ON f.id_User = u.id
LEFT JOIN `Farm-Address` fa ON fa.id_Farm = f.id
LEFT JOIN `Address` a ON a.id = fa.id_Address
LEFT JOIN `FarmBasics` fb ON fb.id_Farm = f.id

DROP VIEW IF EXISTS `vFarmFieldCropPlan`;

CREATE VIEW vFarmFieldCropPlan AS
SELECT f.id AS id_Farm, f.Name, ff.id AS id_FarmField, ff.FieldNumber, ff.FieldName, pt.ProduceType, fcup.ExpectedYieldAmount, u.Unit, fcup.PlantingPlannedStartDate, fcup.PlantingPlannedEndDate, fchp.HarvestPlannedStartDate, fchp.HarvestPlannedEndDate
FROM Farm f
LEFT JOIN FarmField ff ON ff.id_Farm = f.id
LEFT JOIN FieldCropUsagePlan fcup ON fcup.id_Field = ff.id
LEFT JOIN FieldCropHarvestingPlan fchp ON fchp.id_FieldCropUsagePlan = fcup.id
LEFT JOIN dmnProduceType pt ON pt.id = fcup.id_Produce
LEFT JOIN dmnUOM u ON u.id = fcup.id_UOM
