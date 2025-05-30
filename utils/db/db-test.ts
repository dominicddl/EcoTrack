import { db } from "./dbConfig";
import { users } from "./schema";

/**
 * Simple function to test database connectivity
 */
async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...");
    
    // Try to query the users table
    const result = await db.select().from(users).limit(1).execute();
    
    console.log("✅ Database connection successful!");
    console.log(`Found ${result.length} users in the database`);
    
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log("Database check completed successfully");
    } else {
      console.log("Database check failed");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });