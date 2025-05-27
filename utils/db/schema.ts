import {integer, varchar, pgTable, serial, text, timestamp, jsonb, boolean} from 'drizzle-orm/pg-core';
//schemas is the usertable, report waste, collected waste, rewards and notifications

//is the user table to store user information
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', {length: 256}).notNull().unique(),
  name: varchar('name', {length: 256}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



// The reports table stores the amount of waste collected by the user and other information needed
// such as amount of waste, the type of the waste, the location of the waste and the date of collection etc
export const reports = pgTable('reports', { 
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id).notNull(),
    location: text('location').notNull(),
    wasteType: varchar('waste_type', {length: 256}).notNull(),
    amount: varchar('amount').notNull(),
    imageUrl: text('image_url').notNull(),
    verificationResult: jsonb('verification_result').notNull(),
    status: varchar('status', {length: 256}).notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    collectorId: integer('collector_id').references(() => users.id),
});


/* // all these are for future milestones when we include extension features.
// rewards table stores the rewards earned by the user for collecting waste, but not needed yet as part of MS1
export const rewards = pgTable('rewards', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id).notNull(),
    points: integer('points').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isAvailable: boolean('is_available').notNull().default(true),
    description: text('description'),
    name: varchar('name', {length: 256}).notNull(),
    collectionInfo: text('collection_info').notNull()
});

//collected waste table stores the collected waste information by the collector, but not needed yet as part of MS1
export const collectedWaste = pgTable('collected_waste', {
    id: serial('id').primaryKey(),
    reportId: integer('report_id').references(() => reports.id).notNull(),
    collectorId: integer('collector_id').references(() => users.id).notNull(),
    collectionDate: timestamp('collection_date').notNull(),
    status: varchar('status', {length: 256}).notNull().default('collected'),
});

// notifications table stores the notifications sent to the user, but not needed yet as part of MS1
export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    message: text('message').notNull(),
    type: varchar('type', {length: 256}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isRead: boolean('is_read').notNull().default(false),
});

// related to rewards, but not needed yet as part of MS1
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: varchar('type', {length: 50}).notNull(), // eg redeemed and earned
    amount: integer('amount').notNull(), // points or money
    description: text('description').notNull(), 
    date: timestamp('date').defaultNow().notNull(),
}); */




