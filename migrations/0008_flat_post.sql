ALTER TABLE `USERS` MODIFY COLUMN `EMAIL_VERIFIED` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `USERS` MODIFY COLUMN `EMAIL_VERIFIED` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `EMAIL_VERIFIED_USER` ADD CONSTRAINT `EMAIL_VERIFIED_USER_USER_ID_USERS_ID_fk` FOREIGN KEY (`USER_ID`) REFERENCES `USERS`(`ID`) ON DELETE no action ON UPDATE no action;