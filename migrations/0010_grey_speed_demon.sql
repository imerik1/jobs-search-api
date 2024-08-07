CREATE TABLE `USERS_TEMPORARY` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`DELETED` boolean DEFAULT false,
	`DELETED_AT` timestamp,
	`CREATED_AT` timestamp DEFAULT (now()),
	`UPDATED_AT` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`EMAIL` varchar(30) NOT NULL,
	`FIRST_NAME` varchar(30) NOT NULL,
	`LAST_NAME` varchar(30) NOT NULL,
	`TERMS_CONDITION` boolean DEFAULT false,
	`SALT` varchar(300) NOT NULL,
	`HASH` varchar(300) NOT NULL,
	CONSTRAINT `USERS_TEMPORARY_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
ALTER TABLE `EMAIL_VERIFIED_USER` RENAME COLUMN `USER_ID` TO `USER_TEMPORARY_ID`;--> statement-breakpoint
ALTER TABLE `EMAIL_VERIFIED_USER` DROP FOREIGN KEY `EMAIL_VERIFIED_USER_USER_ID_USERS_ID_fk`;
--> statement-breakpoint
ALTER TABLE `EMAIL_VERIFIED_USER` ADD CONSTRAINT `EMAIL_VERIFIED_USER_USER_TEMPORARY_ID_USERS_TEMPORARY_ID_fk` FOREIGN KEY (`USER_TEMPORARY_ID`) REFERENCES `USERS_TEMPORARY`(`ID`) ON DELETE no action ON UPDATE no action;