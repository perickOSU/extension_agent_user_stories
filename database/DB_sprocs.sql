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
***********************************************************************/
DROP PROCEDURE IF EXISTS sp_registerUser;

DELIMITER $$
CREATE PROCEDURE `sp_registerUser`
(
  IN `p_FirstName` VARCHAR(50), 
  IN `p_LastName` VARCHAR(50), 
  IN `p_Handle` VARCHAR(50), 
  IN `p_DateRegistered` DATETIME
)
BEGIN
  INSERT INTO `User`
  (
    FirstName,
    LastName,
    Handle,
    DateRegistered
  )
  VALUES
  (
    p_FirstName,
    p_LastName,
    p_Handle,
    p_DateRegistered
  );
END$$
DELIMITER ;