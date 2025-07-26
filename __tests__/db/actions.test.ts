import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import * as dbActions from "../../utils/db/actions";
import { db } from "../../utils/db/dbConfig";

type TransactionType = "earned_report" | "earned_collect" | "redeemed";

// Mock the database
jest.mock("../../utils/db/dbConfig", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => ({
          execute: jest.fn(() => [
            { id: 1, email: "test@example.com", name: "Test User" },
          ]),
        })),
      })),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(() => [
            { id: 1, email: "test@example.com", name: "Test User" },
          ]),
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              execute: jest.fn(() => [
                {
                  id: 1,
                  type: "earned_report",
                  amount: 10,
                  description: "Test transaction",
                  date: new Date(),
                },
              ]),
            })),
          })),
        })),
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            execute: jest.fn(() => [
              {
                id: 1,
                type: "earned_report",
                amount: 10,
                description: "Test transaction",
                date: new Date(),
              },
            ]),
          })),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(),
        })),
      })),
    })),
  },
}));

describe("Database Actions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should create a new user successfully", async () => {
      const email = "test@example.com";
      const name = "Test User";

      const result = await dbActions.createUser(email, name);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        name: "Test User",
      });
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("getUserByEmail", () => {
    test("should fetch user by email successfully", async () => {
      const email = "test@example.com";

      const result = await dbActions.getUserByEmail(email);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        name: "Test User",
      });
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("getUserBalance", () => {
    test("should never return negative balance", async () => {
      const userId = 1;
      const mockTransactions = [
        {
          id: 1,
          type: "earned_report",
          amount: 10,
          description: "Test",
          date: "2024-01-01",
        },
        {
          id: 2,
          type: "redeemed",
          amount: 20,
          description: "Test",
          date: "2024-01-02",
        },
      ];

      // Mock db.select to return our mock transactions
      const selectMock = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => ({
                execute: jest.fn(() => mockTransactions),
              })),
            })),
          })),
        })),
      }));
      (db.select as jest.Mock).mockImplementation(selectMock);

      const balance = await dbActions.getUserBalance(userId);

      // Should be 0 instead of -10
      expect(balance).toBe(0);
    });
  });

  describe("createTransaction", () => {
    test("should create transaction successfully", async () => {
      const userId = 1;
      const type: TransactionType = "earned_report";
      const amount = 10;
      const description = "Test transaction";

      const result = await dbActions.createTransaction(
        userId,
        type,
        amount,
        description,
      );

      expect(result).toBeTruthy();
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("Notifications", () => {
    test("should create notification successfully", async () => {
      const userId = 1;
      const message = "Test notification";
      const type = "reward";

      const result = await dbActions.createNotification(userId, message, type);

      expect(result).toBeTruthy();
      expect(db.insert).toHaveBeenCalled();
    });

    test("should fetch unread notifications", async () => {
      const userId = 1;

      const result = await dbActions.getUnreadNotifications(userId);

      expect(Array.isArray(result)).toBe(true);
      expect(db.select).toHaveBeenCalled();
    });

    test("should mark notification as read", async () => {
      const notificationId = 1;

      await dbActions.markNotificationAsRead(notificationId);

      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("getRewardTransactions", () => {
    test("should fetch reward transactions successfully", async () => {
      const userId = 1;
      const mockTransactions = [
        {
          id: 1,
          type: "earned_report",
          amount: 10,
          description: "Test transaction",
          date: new Date(),
        },
      ];

      // Mock db.select to return our mock transactions
      const selectMock = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => ({
                execute: jest.fn(() => mockTransactions),
              })),
            })),
          })),
        })),
      }));
      (db.select as jest.Mock).mockImplementation(selectMock);

      const result = await dbActions.getRewardTransactions(userId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("amount");
      expect(db.select).toHaveBeenCalled();
    });

    test("should format dates correctly", async () => {
      const userId = 1;
      const mockTransactions = [
        {
          id: 1,
          type: "earned_report",
          amount: 10,
          description: "Test transaction",
          date: new Date(),
        },
      ];

      // Mock db.select to return our mock transactions
      const selectMock = jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => ({
                execute: jest.fn(() => mockTransactions),
              })),
            })),
          })),
        })),
      }));
      (db.select as jest.Mock).mockImplementation(selectMock);

      const result = await dbActions.getRewardTransactions(userId);

      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
      expect(db.select).toHaveBeenCalled();
    });
  });
});
