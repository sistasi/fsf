CREATE TABLE `sakila`.`books` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `author` VARCHAR(45) NOT NULL,
  `published_year` YEAR NOT NULL,
  `isbn` BIGINT(13) NULL,
  PRIMARY KEY (`id`));