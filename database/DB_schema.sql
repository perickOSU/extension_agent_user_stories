/***********************************************************************
Name:     ExtensionAgent MySQL Database
Desc:     
Devs:     Brian Bruckner
          Alexander "Jake" Gilmour
          Nicholas Masie
          Kruno Peric
Class:    Software Engineering I (CS_361_400_F2017)
Due Date: 19-NOV-2017 (sprint 1), 01-DEC-2017 (sprint 2)

Notes:
  1) User model derived from: 
     Building The Optimal User Database Model For Your Application (https://www.getdonedone.com/building-the-optimal-user-database-model-for-your-application/)
  2) Developing Multi-tenant Applications for the Cloud, 3rd Edition.  Chapter 3: Choosing a Multi-Tenant Data Architecture (https://msdn.microsoft.com/en-us/library/hh534480.aspx)
  3*) Multi-Tenant Data Architecture (http://web.archive.org/web/20170530080303/https://msdn.microsoft.com/en-us/library/aa479086.aspx)
  4) Design patterns for multi-tenant SaaS applications and Azure SQL Database (https://docs.microsoft.com/en-us/azure/sql-database/sql-database-design-patterns-multi-tenancy-saas-applications)
  Trusted Database Connections
  Tenant View Filter
  Tenant Data Encryption
  
  Service Level Agrement (http://en.wikipedia.org/wiki/Service_level_agreement)
  
  Selected pattern: Shared database-single. A single, sometimes large, database contains data for all tenants, which are disambiguated in a tenant ID column.
***********************************************************************/

-- CREATE DATABASE IF NOT EXISTS `extagent`;

USE `cs361_bruckneb`;

-- Set foreign key checks to 0 during execution of this script
SET FOREIGN_KEY_CHECKS = 0;

/*======================================================================
  USER-MANAGED TABLES
======================================================================*/

/*----------------------------------------------------------------------
  Table structure for Farm
  This table allows for management of Farm master data
  It is ordinarily managed by the user at run time
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `Farm`;

CREATE TABLE `Farm` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_User` INT(11) NOT NULL,
  `Name` VARCHAR(50) NOT NULL,
  `FarmInfo` VARCHAR(2000),
  `TotalAcreage` FLOAT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for FarmAddress
  This table allows for management of m:n relationship of Farm and 
  address (e.g., mailing address, corporate headquarters, etc.).
  It is ordinarily managed by the user at run time
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `Farm-Address`;

CREATE TABLE `Farm-Address` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Farm` INT(11) NOT NULL,
  `id_Address` INT(11) NOT NULL,
  `id_AddressType` INT(11),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for Address data
  This table allows for management of address data
  It is ordinarily managed by the user at run time
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `Address`;

CREATE TABLE `Address` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `Address1` VARCHAR(50),
  `Address2` VARCHAR(50),
  `Address3` VARCHAR(50),
  `City` VARCHAR(50) NOT NULL,
  `StateProvince` VARCHAR(50) NOT NULL,
  `PostalCode` VARCHAR(10) NOT NULL,
  `Country` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FarmField`;

CREATE TABLE `FarmField` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Farm` INT(11) NOT NULL,
  `FieldNumber` INT,
  `FieldName` VARCHAR(50),
  `Acreage` FLOAT,
  `FieldLocation` VARCHAR(50),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FarmInvLivestock`;

CREATE TABLE `FarmInvLivestock` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Farm` INT(11) NOT NULL,
  `id_LivestockType` INT(11) NOT NULL,
  /*`id_LivestockSubtype` INT(11),*/
  `Count` INT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FarmInvProduce`;

CREATE TABLE `FarmInvProduce` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Farm` INT(11) NOT NULL,
  `id_ProduceType` INT(11) NOT NULL,
  /*`ProduceSubtype` INT(11),*/
  `Quantity` FLOAT,
  `id_UOM` INT(11),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FarmInvEquipment`;

CREATE TABLE `FarmInvEquipment` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Farm` INT(11) NOT NULL,
  `id_EquipmentType` INT(11) NOT NULL,
  /*`EquipmentSubType*/
  `Count` INT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FieldCropUsagePlan`;

CREATE TABLE `FieldCropUsagePlan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Field` INT(11) NOT NULL,
  `id_UOM` INT(11) NOT NULL,
  `ExpectedYieldAmount` FLOAT,
  `ActualYieldAmount` FLOAT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FieldCropHarvestingPlan`;

CREATE TABLE `FieldCropHarvestingPlan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_FieldCropUsagePlan` INT(11) NOT NULL,
  `HarvestPlannedStartDate` DATE,
  `HarvestPlannedEndDate` DATE,
  `HarvestActualStartDate` DATE,
  `HarvestActualEndDate` DATE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FieldHusbandryUsagePlan`;

CREATE TABLE `FieldHusbandryUsagePlan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_Field` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `FieldHusbandryHarvestingPlan`;

CREATE TABLE `FieldHusbandryHarvestingPlan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_FieldHusbandryUsagePlan` INT(11) NOT NULL,
  `HarvestPlannedStartDate` DATE,
  `HarvestPlannedEndDate` DATE,
  `HarvestActualStartDate` DATE,
  `HarvestActualEndDate` DATE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


/*======================================================================
  SYSTEM-MANAGED TABLES
======================================================================*/
/*----------------------------------------------------------------------
  Table structure for User
  This table allows for management of Users of the system
  Records are created in this table when users register
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `FirstName` VARCHAR(50) NOT NULL,
  `LastName` VARCHAR(50) NOT NULL,
  `Handle` VARCHAR(50) NOT NULL,
  `DateRegistered` DATETIME,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*======================================================================
  DOMAIN TABLES
======================================================================*/

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `dmnLivestockType`;

CREATE TABLE `dmnLivestockType` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `LivestockType` VARCHAR(50) NOT NULL,
  /*`LivestockSubtype,*/
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Load domain data for dmnLivestockType
INSERT INTO `dmnLivestockType` (`LivestockType`) VALUES
  ('Cattle-Beef'), 
  ('Cattle-Dairy'), 
  ('Pigs'), 
  ('Chickens')
;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `dmnProduceType`;

CREATE TABLE `dmnProduceType` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ProduceType` VARCHAR(50) NOT NULL,
  /*`ProduceSubtype,*/
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Load domain data for dmnProduceType
INSERT INTO `dmnProduceType` (`ProduceType`) VALUES
  ('Corn'), 
  ('Wheat'), 
  ('Soybeans'), 
  ('Rye'),
  ('Cover crop?')
;
/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `dmnEquipmentType`;

CREATE TABLE `dmnEquipmentType` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `EquipmentType` VARCHAR(50) NOT NULL,
  /*`EquipmentSubType,*/
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Load domain data for dmnEquipmentType
INSERT INTO `dmnEquipmentType` (`EquipmentType`) VALUES
  ('Tractor'), 
  ('Plow'), 
  ('Irrigation Pump'), 
  ('Tiller'),
  ('Irrigation Head')
;

/*----------------------------------------------------------------------
  Table structure for dmnAddressType
  This table allows for management of types of addresses (e.g., mailing 
  address, corporate headquarters, etc.).
  It is managed by the application's system administrator, not by users
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `dmnAddressType`;

CREATE TABLE `dmnAddressType` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `AddressType` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `dmnAddressType` (`AddressType`) VALUES
  ('Mailing'),
  ('Corp HQ') 
;

/*----------------------------------------------------------------------
  Table structure for 
  This table allows for 
  It is ordinarily managed by 
----------------------------------------------------------------------*/
DROP TABLE IF EXISTS `dmnUOM`;

CREATE TABLE `dmnUOM` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `System` VARCHAR(50) NOT NULL,
  `Measure` VARCHAR(50) NOT NULL,
  `Unit` VARCHAR(50) NOT NULL,
  `Symbol` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Load domain data for dmndMetrology
INSERT INTO `dmnUOM` (`System`, `Measure`, `Unit`, `Symbol`) VALUES
  ('Metric', 'Area', 'Hectare', 'ha'),
  ('Imperial', 'Area', 'Acre', 'ac'), 
  ('Imperial', 'Volume', 'Bushel', 'bu'), 
  ('Imperial', 'Weight', 'Pound', 'lb')
;

/*======================================================================
  CONSTRAINTS
======================================================================*/

ALTER TABLE `Farm`
ADD CONSTRAINT `farm_fk1` FOREIGN KEY (`id_User`) REFERENCES `User` (`id`);

ALTER TABLE `Farm-Address`
ADD CONSTRAINT `farm-address_fk1` FOREIGN KEY (`id_Farm`) REFERENCES `Farm` (`id`);

ALTER TABLE `Farm-Address`
ADD CONSTRAINT `farm-address_fk2` FOREIGN KEY (`id_Address`) REFERENCES `Address` (`id`);

ALTER TABLE `Farm-Address`
ADD CONSTRAINT `farm-address_fk3` FOREIGN KEY (`id_AddressType`) REFERENCES `dmnAddressType` (`id`);

ALTER TABLE `FarmField`
ADD CONSTRAINT `farmfield_fk1` FOREIGN KEY (`id_Farm`) REFERENCES `Farm` (`id`);

ALTER TABLE `FarmInvLivestock`
ADD CONSTRAINT `farminvlivestock_fk1` FOREIGN KEY (`id_Farm`) REFERENCES `Farm` (`id`);

ALTER TABLE `FarmInvLivestock`
ADD CONSTRAINT `farminvlivestock_fk2` FOREIGN KEY (`id_LivestockType`) REFERENCES `dmnLivestockType` (`id`);

ALTER TABLE `FarmInvProduce`
ADD CONSTRAINT `farminvproduce_fk1` FOREIGN KEY (`id_Farm`) REFERENCES `Farm` (`id`);

ALTER TABLE `FarmInvProduce`
ADD CONSTRAINT `farminvproduce_fk2` FOREIGN KEY (`id_ProduceType`) REFERENCES `dmnProduceType` (`id`);

ALTER TABLE `FarmInvProduce`
ADD CONSTRAINT `farminvproduce_fk3` FOREIGN KEY (`id_UOM`) REFERENCES `dmnUOM` (`id`);

ALTER TABLE `FarmInvEquipment`
ADD CONSTRAINT `farminvequipment_fk1` FOREIGN KEY (`id_Farm`) REFERENCES `Farm` (`id`);

ALTER TABLE `FarmInvEquipment`
ADD CONSTRAINT `farminvequipment_fk2` FOREIGN KEY (`id_EquipmentType`) REFERENCES `dmnEquipmentType` (`id`);

ALTER TABLE `FieldCropUsagePlan`
ADD CONSTRAINT `fieldcropusageplan_fk1` FOREIGN KEY (`id_Field`) REFERENCES `FarmField` (`id`);

ALTER TABLE `FieldCropUsagePlan`
ADD CONSTRAINT `fieldcropusageplan_fk2` FOREIGN KEY (`id_UOM`) REFERENCES `dmnUOM` (`id`);

ALTER TABLE `FieldCropHarvestingPlan`
ADD CONSTRAINT `fieldcropharvestingplan_fk1` FOREIGN KEY (`id_FieldCropUsagePlan`) REFERENCES `FieldCropUsagePlan` (`id`);

ALTER TABLE `FieldHusbandryUsagePlan`
ADD CONSTRAINT `fieldhusbandryusageplan_fk1` FOREIGN KEY (`id_Field`) REFERENCES `FarmField` (`id`);

ALTER TABLE `FieldHusbandryHarvestingPlan`
ADD CONSTRAINT `fieldhusbandryharvestingplan_fk1` FOREIGN KEY (`id_FieldHusbandryUsagePlan`) REFERENCES `FieldHusbandryUsagePlan` (`id`);

/*----------------------------------------------------------------------
  Finalize script
----------------------------------------------------------------------*/
SET FOREIGN_KEY_CHECKS = 1;