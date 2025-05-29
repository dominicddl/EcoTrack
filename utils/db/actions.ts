import { db } from "./dbConfig";
import { notifications, Transactions, users } from "./schema";
import { eq, sql, and, desc } from "drizzle-orm";

export async function createUser(email: string, name: string) {
    try {
        const [user] = await db.insert(users).values({email, name}).returning().execute()
        return user;
    } catch (error) {
        console.error("Error creating user", error);
        return null
    }
}

export async function getUserByEmail(email: string) {
    try {
        const [user] = await db.select().from(users).where(eq(users.email , email)).execute()
        return user;
    } catch(error) {
        console.error("Error fetching user by email", error)
        return null;
    }
}

export async function getUnreadNotifications(userId: number) {
    try {
        return await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))).execute();
    } catch(error) {
        console.error("Error fetching unread notifications", error);
        return null;
    }
}

export async function getUserBalance(userId: number): Promise<number> {
    const transactions = await db.select({
        type: Transactions.type,
        amount: Transactions.amount,
    }).from(Transactions).where(eq(Transactions.userId, userId)).execute();

    // Calculate balance based on transactions
    const balance = transactions.reduce((acc: number, transaction: {
        type: string;
        amount: number;
    }) => {
        return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

    return Math.max(balance, 0); // Ensure balance is not negative
}

export async function getRewardTransactions(userId: number) {
    try{
        const transactions = await db.select({
            id: Transactions.id,
            type: Transactions.type,
            amount: Transactions.amount,
            description: Transactions.description,
            date: Transactions.date
        }).from(Transactions).where(eq(Transactions.userId, userId)).orderBy(desc(Transactions.date)).limit(10).execute();

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction,
            date: transaction.date.toISOString().split('T')[0] // Convert date to ISO string for consistency
        }))

        return formattedTransactions;
    } catch(error) {
        console.error("Error fetching reward transactions", error);
        return null;
    }
}

export async function markNotificationAsRead(notificationId: number) {
    try {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId)).execute();
    } catch(error) {
        console.error("Error marking notification as read", error);
        return null;
    }
}