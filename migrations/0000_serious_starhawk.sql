CREATE TABLE `DEVICES_USER` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`DELETED` boolean DEFAULT false,
	`DELETED_AT` timestamp,
	`CREATED_AT` timestamp DEFAULT (now()),
	`UPDATED_AT` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`IP_ADDRESS` varchar(32) NOT NULL,
	`SOURCE` varchar(20),
	`CITY` varchar(20),
	`STATE` varchar(3),
	`COUNTRY` varchar(3),
	`OPERATION_SYSTEM` varchar(20),
	`USER_ID` bigint NOT NULL,
	CONSTRAINT `DEVICES_USER_ID` PRIMARY KEY(`ID`),
	CONSTRAINT `DEVICES_USER_IP_ADDRESS_unique` UNIQUE(`IP_ADDRESS`)
);
--> statement-breakpoint
CREATE TABLE `JOBS_ADS` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`DELETED` boolean DEFAULT false,
	`DELETED_AT` timestamp,
	`CREATED_AT` timestamp DEFAULT (now()),
	`UPDATED_AT` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`TITLE` varchar(80),
	`DESCRIPTION` varchar(300),
	`COMPANY_NAME` varchar(40),
	`MIN_SALARY` decimal(2),
	`MAX_SALARY` decimal(2),
	`LOCATION` varchar(300),
	`REMOTE` boolean DEFAULT false,
	`TERMS_CONDITION` boolean DEFAULT false,
	`SEND_EMAIL_TO_SIGNATURE` boolean DEFAULT false,
	`USER_ID` bigint NOT NULL,
	CONSTRAINT `JOBS_ADS_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `TERMS_JOB_USER` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`DELETED` boolean DEFAULT false,
	`DELETED_AT` timestamp,
	`CREATED_AT` timestamp DEFAULT (now()),
	`UPDATED_AT` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`TERMS_CONDITION` boolean DEFAULT false,
	`USER_ID` bigint NOT NULL,
	`JOB_ID` bigint NOT NULL,
	CONSTRAINT `TERMS_JOB_USER_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `USERS` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`DELETED` boolean DEFAULT false,
	`DELETED_AT` timestamp,
	`CREATED_AT` timestamp DEFAULT (now()),
	`UPDATED_AT` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`FIRST_NAME` varchar(30) NOT NULL,
	`LAST_NAME` varchar(30) NOT NULL,
	`PICTURE_URL` varchar(200),
	`TERMS_CONDITION` boolean DEFAULT false,
	`EMAIL` varchar(30) NOT NULL,
	CONSTRAINT `USERS_ID` PRIMARY KEY(`ID`),
	CONSTRAINT `USERS_EMAIL_unique` UNIQUE(`EMAIL`)
);
--> statement-breakpoint
ALTER TABLE `TERMS_JOB_USER` ADD CONSTRAINT `TERMS_JOB_USER_USER_ID_USERS_ID_fk` FOREIGN KEY (`USER_ID`) REFERENCES `USERS`(`ID`) ON DELETE no action ON UPDATE no action;