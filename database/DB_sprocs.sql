USE `cs361_bruckneb`;

/***********************************************************************
sp_addFarm
Purpose: Inserts basic farm data (see parameters) into database
***********************************************************************/
DROP PROCEDURE IF EXISTS `sp_addFarm`;

DELIMITER $$
CREATE PROCEDURE `sp_addFarm`
(
  IN `p_Name` VARCHAR(50), 
  IN `p_FarmInfo` VARCHAR(2000), 
  IN `p_TotalAcreage` FLOAT
)
BEGIN
  INSERT INTO `Farm` 
  ( 
    Name, 
    FarmInfo, 
    TotalAcreage 
  )
  VALUES 
  ( 
    p_Name, 
    p_FarmInfo, 
    p_TotalAcreage
  );
END$$
DELIMITER ;

/***********************************************************************
sp_GetFarmCount
Purpose: Inserts basic farm data (see parameters) into database
Returns: recCount = 0 if farm doesn't exist
***********************************************************************/
DROP PROCEDURE IF EXISTS `sp_GetFarmCount`;

DELIMITER $$
CREATE PROCEDURE `sp_GetFarmCount`
(
  IN `p_id` INT,
  OUT `recCount` INT
)
BEGIN
  SELECT COUNT(*)
  INTO recCount 
  FROM Farm 
  WHERE id = p_id;
END;
$$
DELIMITER ;

/***********************************************************************
sp_registerUser
Purpose: Inserts basic farm data (see parameters) into database

Example calls:
CALL sp_registerUser('New', 'User1', 'newuser1', 'nu farm 1', 40, '68154', 'corn', '');
***********************************************************************/
DROP PROCEDURE IF EXISTS sp_registerUser;

DELIMITER $$
CREATE PROCEDURE `sp_registerUser`
(
  IN `p_FirstName` VARCHAR(50), 
  IN `p_LastName` VARCHAR(50), 
  IN `p_Handle` VARCHAR(50), 
  IN `p_FarmName` VARCHAR(50),
  IN `p_Acreage` FLOAT,
  IN `p_PostalCode` VARCHAR(10),
  IN `p_Crop` VARCHAR(255),
  IN `p_Livestock` VARCHAR(255)
)
BEGIN
  DECLARE id_User, id_Farm, id_Address INTEGER;
  
  INSERT INTO `User`
  (
    FirstName,
    LastName,
    Handle
  )
  VALUES
  (
    p_FirstName,
    p_LastName,
    p_Handle
  );
  SELECT LAST_INSERT_ID() into id_User;
  
  INSERT INTO `Farm`
  (
    id_User,
	Name,
	TotalAcreage
  )
  VALUES
  (
    id_User,
	p_FarmName,
	p_Acreage
  );
  SELECT LAST_INSERT_ID() into id_Farm;
  
  INSERT INTO `Address`
  (
    PostalCode
  )
  VALUES
  (
    p_PostalCode
  );
  SELECT LAST_INSERT_ID() into id_Address;
  
  INSERT INTO `Farm-Address`
  (
    id_Farm,
	id_Address
  )
  VALUES
  (
    id_Farm,
	id_Address
  );
  
  INSERT INTO `FarmBasics`
  (
    id_Farm,
	crop,
	livestock
  )
  VALUES
  (
    id_Farm,
	p_Crop,
	p_Livestock
  );
  
  SELECT id_User;
  
END$$
DELIMITER ;

/***********************************************************************
sp_setupFieldCropUsage
Purpose: Inserts crop usage plan for a field into database

Example calls:
CALL sp_setupFieldCropUsage(1, 1, 3, '2017-11-25', '2017-11-30', 200.1, '2018-05-29', '2018-05-31');
CALL sp_setupFieldCropUsage(1, 5, 4, '2018-06-01', '2018-06-03', 40000.0, '2018-06-29', '2018-06-30');
CALL sp_setupFieldCropUsage(1, 2, 3, '2018-07-01', '2018-07-03', 200.1, '2018-08-29', '2018-08-31');
CALL sp_setupFieldCropUsage(1, 5, 4, '2018-09-01', '2018-09-03', 40000.0, '2018-10-29', '2018-10-31');
***********************************************************************/
DROP PROCEDURE IF EXISTS sp_setupFieldCropUsage;

DELIMITER $$
CREATE PROCEDURE `sp_setupFieldCropUsage`
(
  IN `p_idFarmField` INT(11), 
  IN `p_idProduce` INT(11), 
  IN `p_idUOM` INT(11), 
  IN `p_PlantingPlannedStartDate` DATE,
  IN `p_PlantingPlannedEndDate` DATE,
  IN `p_ExpectedYield` FLOAT,
  IN `p_HarvestPlannedStartDate` DATE,
  IN `p_HarvestPlannedEndDate` DATE
)
BEGIN
  DECLARE id_FieldCropUsagePlan, id_FieldCropHarvestingPlan INTEGER;
  
  INSERT INTO `FieldCropUsagePlan`
  (
    id_Field,
	id_Produce,
    id_UOM,
    PlantingPlannedStartDate,
    PlantingPlannedEndDate,
    ExpectedYieldAmount
  )
  VALUES
  (
    p_idFarmField,
    p_idProduce,
    p_idUOM,
    p_PlantingPlannedStartDate,
    p_PlantingPlannedEndDate,
    p_ExpectedYield
  );
  SELECT LAST_INSERT_ID() into id_FieldCropUsagePlan;
  
  INSERT INTO `FieldCropHarvestingPlan`
  (
    id_FieldCropUsagePlan,
	HarvestPlannedStartDate,
	HarvestPlannedEndDate
  )
  VALUES
  (
    id_FieldCropUsagePlan,
	p_HarvestPlannedStartDate,
	p_HarvestPlannedEndDate
  );
  SELECT LAST_INSERT_ID() into id_FieldCropHarvestingPlan;
    
  SELECT id_FieldCropUsagePlan;
  
END$$
DELIMITER ;

/***********************************************************************
sp_setupFieldHusbandryUsage
Purpose: Inserts crop usage plan for a field into database

Example calls:
CALL sp_setupFieldHusbandryUsage(1, 1, '2017-11-25', '2018-05-31');
***********************************************************************/
DROP PROCEDURE IF EXISTS sp_setupFieldHusbandryUsage;

DELIMITER $$
CREATE PROCEDURE `sp_setupFieldHusbandryUsage`
(
  IN `p_idFarmField` INT(11), 
  IN `p_idLivestockType` INT(11), 
  IN `p_HarvestPlannedStartDate` DATE,
  IN `p_HarvestPlannedEndDate` DATE
)
BEGIN
  DECLARE id_FieldHusbandryUsagePlan, id_FieldHusbandryHarvestingPlan INTEGER;
  
  INSERT INTO `FieldHusbandryUsagePlan`
  (
    id_Field,
	id_LivestockType
  )
  VALUES
  (
    p_idFarmField,
    p_idLivestockType
  );
  SELECT LAST_INSERT_ID() into id_FieldHusbandryUsagePlan;
  
  INSERT INTO `FieldHusbandryHarvestingPlan`
  (
    id_FieldHusbandryUsagePlan,
	HarvestPlannedStartDate,
	HarvestPlannedEndDate
  )
  VALUES
  (
    id_FieldHusbandryUsagePlan,
	p_HarvestPlannedStartDate,
	p_HarvestPlannedEndDate
  );
  SELECT LAST_INSERT_ID() into id_FieldHusbandryHarvestingPlan;
    
  SELECT id_FieldHusbandryUsagePlan;
  
END$$
DELIMITER ;



