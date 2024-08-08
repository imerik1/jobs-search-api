import { relations } from 'drizzle-orm';
import {
	bigint,
	boolean,
	decimal,
	mysqlTable,
	timestamp,
	varchar,
} from 'drizzle-orm/mysql-core';

const bigInt = (fieldName: string) => bigint(fieldName, { mode: 'bigint' });

const baseTable = {
	id: bigint('ID', { mode: 'bigint' }).autoincrement().primaryKey(),
	deleted: boolean('DELETED').default(false),
	deletedAt: timestamp('DELETED_AT'),
	createdAt: timestamp('CREATED_AT').defaultNow(),
	updatedAt: timestamp('UPDATED_AT').defaultNow().onUpdateNow(),
};

export const users = mysqlTable('USERS', {
	...baseTable,
	firstName: varchar('FIRST_NAME', { length: 30 }).notNull(),
	lastName: varchar('LAST_NAME', { length: 30 }).notNull(),
	picture: varchar('PICTURE_URL', { length: 200 }),
	termsCondition: boolean('TERMS_CONDITION').default(false),
	email: varchar('EMAIL', { length: 30 }).notNull().unique(),
	emailVerified: boolean('EMAIL_VERIFIED').notNull().default(false),
});

export const userRelations = relations(users, ({ one, many }) => ({
	password: one(passwordUser),
	devices: many(devicesUser),
	jobsAds: many(jobsAds),
	termsJob: many(termsJobUser),
}));

export const usersTemporary = mysqlTable('USERS_TEMPORARY', {
	...baseTable,
	email: varchar('EMAIL', { length: 30 }).notNull(),
	firstName: varchar('FIRST_NAME', { length: 30 }).notNull(),
	lastName: varchar('LAST_NAME', { length: 30 }).notNull(),
	termsCondition: boolean('TERMS_CONDITION').default(false),
	salt: varchar('SALT', { length: 300 }).notNull(),
	hash: varchar('HASH', { length: 300 }).notNull(),
});

export const emailVerifiedUser = mysqlTable('EMAIL_VERIFIED_USER', {
	...baseTable,
	code: varchar('CODE', { length: 120 }).notNull().unique(),
	expiresIn: timestamp('EXPIRES_IN').notNull(),
	userId: bigInt('USER_TEMPORARY_ID')
		.references(() => usersTemporary.id)
		.notNull(),
});

export const passwordUser = mysqlTable('PASSWORD_USER', {
	...baseTable,
	salt: varchar('SALT', { length: 300 }).notNull(),
	hash: varchar('HASH', { length: 300 }).notNull(),
	userId: bigInt('USER_ID')
		.references(() => users.id)
		.notNull(),
});

export const termsJobUser = mysqlTable('TERMS_JOB_USER', {
	...baseTable,
	termsCondition: boolean('TERMS_CONDITION').default(false),
	userId: bigInt('USER_ID')
		.references(() => users.id)
		.notNull(),
	jobId: bigInt('JOB_ID')
		.references(() => jobsAds.id)
		.notNull(),
});

export const termsJobUserRelations = relations(termsJobUser, ({ one }) => ({
	user: one(users, {
		fields: [termsJobUser.userId],
		references: [users.id],
	}),
	jobAds: one(jobsAds, {
		fields: [termsJobUser.jobId],
		references: [jobsAds.id],
	}),
}));

export const devicesUser = mysqlTable('DEVICES_USER', {
	...baseTable,
	ipAddress: varchar('IP_ADDRESS', { length: 64 }).notNull(),
	source: varchar('SOURCE', { length: 20 }),
	city: varchar('CITY', { length: 20 }),
	state: varchar('STATE', { length: 3 }),
	country: varchar('COUNTRY', { length: 3 }),
	userAgent: varchar('USER_AGENT', { length: 300 }),
	userId: bigInt('USER_ID')
		.references(() => users.id)
		.notNull(),
});

export const devicesUserRelations = relations(devicesUser, ({ one }) => ({
	user: one(users, {
		fields: [devicesUser.userId],
		references: [users.id],
	}),
}));

export const jobsAds = mysqlTable('JOBS_ADS', {
	...baseTable,
	title: varchar('TITLE', { length: 80 }),
	description: varchar('DESCRIPTION', { length: 300 }),
	companyName: varchar('COMPANY_NAME', { length: 40 }),
	minSalary: decimal('MIN_SALARY', { precision: 2 }),
	maxSalary: decimal('MAX_SALARY', { precision: 2 }),
	location: varchar('LOCATION', { length: 300 }),
	remote: boolean('REMOTE').default(false),
	termsCondition: boolean('TERMS_CONDITION').default(false),
	sendEmailToSignature: boolean('SEND_EMAIL_TO_SIGNATURE').default(false),
	signatureBy: bigInt('USER_ID')
		.references(() => users.id)
		.notNull(),
});

export const jobsAdsRelations = relations(jobsAds, ({ one, many }) => ({
	user: one(users, {
		fields: [jobsAds.signatureBy],
		references: [users.id],
	}),
	termsUser: many(termsJobUser),
}));
