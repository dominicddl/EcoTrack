import { getUserBalance } from '@/utils/db/actions';
import { db } from '@/utils/db/dbConfig';

jest.mock('@/utils/db/dbConfig', () => {
  const mockExecute = jest.fn();
  return {
    db: {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            execute: mockExecute,
          })),
        })),
      })),
      __mockExecute: mockExecute, // expose for test control
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { db: mockedDb } = require('@/utils/db/dbConfig');

describe('getUserBalance (Drizzle ORM)', () => {
  beforeEach(() => {
    mockedDb.__mockExecute.mockReset();
  });

  it('returns correct balance from mixed transactions', async () => {
    mockedDb.__mockExecute.mockResolvedValue([
      { type: 'earned_signup', amount: 100 },
      { type: 'spent_reward', amount: 40 },
      { type: 'earned_bonus', amount: 20 },
    ]);

    const balance = await getUserBalance(1);
    expect(balance).toBe(80); // 100 + 20 - 40
  });

  it('returns 0 if balance is negative', async () => {
    mockedDb.__mockExecute.mockResolvedValue([
      { type: 'spent_reward', amount: 90 },
      { type: 'spent_fee', amount: 20 },
    ]);

    const balance = await getUserBalance(2);
    expect(balance).toBe(0);
  });

  it('returns 0 if there are no transactions', async () => {
    mockedDb.__mockExecute.mockResolvedValue([]);

    const balance = await getUserBalance(3);
    expect(balance).toBe(0);
  });
});