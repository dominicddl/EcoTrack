import { db } from "./dbConfig";
import { Notifications, Transactions, Users, Reports, Rewards } from "./schema";
import { eq, and, desc, sql } from "drizzle-orm"; 

export async function createUser(email: string, name: string) {
    try {
        // Check if user already exists
        const [existingUser] = await db.select().from(Users).where(eq(Users.email, email)).execute();
        if (existingUser) return existingUser;

        const [user] = await db.insert(Users).values({email, name}).returning().execute();
        return user;
    } catch (error) {
        console.error("Error creating user", error);
        return null;
    }
}

export async function getUserByEmail(email: string) {
    try {
        const [user] = await db.select().from(Users).where(eq(Users.email , email)).execute()
        return user;
    } catch(error) {
        console.error("Error fetching user by email", error)
        return null;
    }
}

export async function getUnreadNotifications(userId: number) {
    try {
        return await db.select().from(Notifications).where(and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))).execute();
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
        await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
    } catch(error) {
        console.error("Error marking notification as read", error);
        return null;
    }
}

export async function createReport(
    userId: number,
    location: string,
    wasteType: string,
    amount: string,
    imageUrl?: string,
    verificationResult? : any
) {
    try {
        const reportData: any = {
            userId,
            location,
            wasteType,
            amount,
            status: 'pending'
        };
        if (imageUrl !== undefined) reportData.imageUrl = imageUrl;
        if (verificationResult !== undefined) reportData.verificationResult = verificationResult;

        const [report] = await db.insert(Reports).values(reportData)
        .returning().execute();
        /* if (imageUrl !== undefined) reportData.imageUrl = imageUrl;
        if (verificationResult !== undefined) reportData.verificationResult = verificationResult; */

        
        const pointsEarned = 10; // Example points for reporting waste

        //update reward points
        await updateRewardPoints(userId, pointsEarned);
        //create transactions
        await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');
        //create nmotifcations
        await createNotification(userId, `You earned ${pointsEarned} points`, "reward" );
        
        return report;
    } catch (e) {
        console.error("Error creating report", e);
        return null;
    }
}

export async function getReportsByUserId(userId: number) {
  try {
    const reports = await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
    try {
        const [updatedReward] = await db.update(Rewards)
            .set({ points: sql`${Rewards.points} + ${pointsToAdd}` })
            .where(eq(Rewards.userId, userId))
            .returning().execute();
            return updatedReward;
    } catch(e) {
        console.error("Error updating reward points", e);
        return null;
    }
}

export async function createTransaction(
    userId: number,
    type: 'earned_report' | 'earned_collect' | 'redeemed',
    amount: number,
    description: string) {
        try {
            const [transaction] = await db.insert(Transactions).values({
                userId, type, amount, description
            }).returning().execute();
            return transaction;
        } catch(e) {
            console.error("Error creating transaction", e);
            throw e;
        }
}  
    
export async function createNotification(userId: number, message: string, type: string) {
    try {
        const [notification] = await db.insert(Notifications).values({
            userId, message, type
        }).returning().execute();
        return notification;
    } catch(e) {
        console.error("Error creating notification", e);
        return null;
    }

}

export async function getRecentReports(limit: number = 5) {
    try {
        const reports = await db.select().from(Reports).orderBy(desc(Reports.createdAt)).limit(limit).execute();
        return reports;
    } catch(e) {
        console.error("Error fetching recent reports", e);
        return [];
    }
}

export async function getAvailableRewards(userId: number) {
    try {

        console.log("Fetching available rewards for user:", userId);

        const userTransactions = await getRewardTransactions(userId) as any;
        const userPoints = userTransactions?.reduce((total:any, transaction:any) => {
            return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
        },
        0 );

        const dbRewards = await db.select({
            id: Rewards.id,
            name: Rewards.name,
            cost: Rewards.points,
            description: Rewards.description,
            collectionInfo: Rewards.collectionInfo,
        }).from(Rewards).where(eq(Rewards.isAvailable, true)).execute();

        const allRewards = [
            {
                id:0,
                name: "Your Points",
                cost: userPoints,
                description: "Your current points",
                collectionInfo: "Points earned from reporting waste and collecting waste"
            },
            ...dbRewards
        ];

        return allRewards;

    } catch (e) {
        console.error("Error fetching available rewards", e);
        return [];
    }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map(task => ({
      ...task,
      date: task.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function saveReward(userId: number, amount: number) {
  try {
    const [reward] = await db
      .insert(Rewards)
      .values({
        userId,
        name: 'Waste Collection Reward',
        collectionInfo: 'Points earned from waste collection',
        points: amount,
        isAvailable: true,
      })
      .returning()
      .execute();
    
    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}