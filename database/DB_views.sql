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

