# EcoTrack (NUS Orbital Project)

EcoTrack, an AI-powered waste management platform.

Proposed level of achievement: Apollo 11

## Promotional Poster
<img src="![6B8243CB-E4A6-4E77-A1F9-9AFA6F937F90](https://github.com/user-attachments/assets/116f18d1-fb03-4fa2-9977-fa8f55039641)" height=240 width=240/>

## Proof-of-Concept : 
https://github.com/user-attachments/assets/7405a2f0-2817-4729-8379-8a0e70848eff



## Before using the app

### Limitations
🔍 1. AI Accuracy & Dependence
	•	Limitation: Reliance on Google Gemini AI for waste classification may lead to incorrect or biased predictions, especially for unclear images.
	•	Impact: Users may get inaccurate rewards or feedback, reducing trust in the system.

⚖️ 2. Verification Bottleneck
	•	Limitation: Waste report verifications may require human validation in some cases, especially for edge scenarios.
	•	Impact: Slows down the reward system and notification flow, reducing real-time effectiveness.

🔒 3. Web3Auth Adoption Barrier
	•	Limitation: Not all users (especially older or less tech-savvy ones) are comfortable with Web3 wallet-based authentication.
	•	Impact: Limits app accessibility and onboarding rate among the general population.


## Milestone 1 (Ideation)
### Motivation
EcoTrack aims to address these pain points by empowering both residents and municipal authorities with real-time data, actionable insights, and user-friendly tools to promote responsible waste disposal and recycling. It is designed to incentivize and streamline waste reporting and collection. Our goal is to create a community-driven approach to waste management, rewarding users for their eco-friendly
actions.

### Proposed core features
<table>
    <thead>
        <tr>
            <th>Features</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>User Authentication & Role Management </td>
            <td>Users (residents, collectors, administrators) can register and log in using web3 authentication.
              <ul>
                - Feature includes: 
                <ul>
                  <li>Wallet-Based Login where users connect via a Web3 wallet (e.g., MetaMask, Web3Auth). The app verifies wallet ownership using cryptographic signatures. No traditional passwords needed.</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>Waste Reporting & Image Upload</td>
            <td>Residents can report waste incidents by uploading photos, specifying waste type, and providing location details. Each report is tracked through various statuses (e.g., pending, collected, verified).
              <ul>
                - Feature includes: 
                <ul>
                  <li>	Users can take or upload a photo of the waste. Image is sent to the backend for storage and optional AI analysis.</li>
                  <li>Users select the type of waste (e.g., plastic, paper, organic, mixed). This input can be used to help train or supplement AI classification.</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>AI-Powered Waste Classification</td>
            <td>When users upload images, the system utilizes Google Gemini AI models to automatically classify the type of waste (e.g., plastic, paper, organic) and estimate its quantity, streamlining the reporting process.
              <ul>
                - Feature includes: 
                <ul>
                  <li>When a user uploads an image, the AI classifies the waste as plastic, paper, organic, etc and reduces manual input and errors from users.
</li>
                  <li>AI estimates the amount of waste (e.g., small/medium/large, or weight approximation) and helps improve reward fairness and collection planning.
</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>Reward Points System</td>
            <td>Users earn points for reporting waste and for successful verifications of waste collection. Points are tracked in user profiles and can be redeemed for incentives, encouraging active participation.
              <ul>
                - Feature includes: 
                <ul>
                  <li>Users earn points for submitting valid waste reports, reports that get verified as collected, participating in campaigns (e.g., clean-up events)</li>
                  <li>Each user’s total points are stored and updated in their profile. Their Points history (earned/redeemed) may also be viewable</li>
                  <li>Users can redeem points for eco-friendly rewards (e.g., vouchers, merchandise). Backend logic ensures only eligible users can redeem.</li>
                  <li>Points are automatically credited based on system triggers (e.g., verified status). Admins can manually adjust points if needed.</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>Real-Time Notifications</td>
            <td>Users and authorities receive notifications for verified waste collection.
              <ul>
                - Feature includes: 
                <ul>
                  <li>Users receive a notification when their reported waste has been verified as collected. Authorities/collectors also get notified when a report status changes to “verified.”</li>
                  <li>Users can view past notifications in a timeline or activity feed.</li>
                  <li>Notification center or banner inside the dashboard to show recent updates.</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>Gamified Leaderboard & Achievements</td>
            <td>A public leaderboard ranks users based on points earned, and achievements or badges are awarded for milestones, fostering friendly competition and community engagement.
              <ul>
                - Feature includes: 
                <ul>
                  <li>Displays top users ranked by total points earned. Can be filtered by time (e.g., weekly, monthly, all-time).
</li>
                  <li>Leaderboard updates in real-time or at fixed intervals after actions like report verification.</li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>

## User Stories
As a resident who wants to contribute to a cleaner neighborhood, I want to easily report overflowing or illegal waste via the app, so that authorities can respond quickly and efficiently.

As a resident who recycles regularly, I want to track my recycling habits and see my progress, so I can stay motivated and improve my environmental impact.

As a busy user, I want to receive timely notifications about waste collection schedules and recycling drives, so I never miss important dates or opportunities to participate.

As a waste collector, I want to view optimized collection routes and real-time bin fill levels, so I can make my rounds more efficiently and avoid unnecessary trips.

As a municipal officer, I want to access analytics and reports on waste generation and recycling rates, so I can make informed decisions about resource allocation and public outreach.

As a community leader, I want to organize local clean-up events and track participation through the app, so I can foster greater community involvement.

As a user with limited technical skills, I want the app to have an intuitive interface and clear instructions, so I can be incentivised to use the app.

As a resident who sometimes forgets to sort waste properly, I want the app to provide educational content and AI-powered waste classification, so I can learn and improve my
sorting habits.

## Software Engineering Practices and Design 

### Software Engineering Practices 
**Primary Architecture: N-tier Architecture with MVC Pattern**

For EcoTrack (an environmental tracking application), we aim to implement a **3-tier layered architecture** combined with the **Model-View-Controller (MVC)** pattern:

```mermaid
graph TB
  subgraph PL[Presentation Layer]
    UI[User Interface]
    Controllers[Controllers]
  end
  subgraph BL[Business Logic Layer]
    Models[Models/Entities]
    Services[Business Services]
    Validators[Data Validators]
  end
  subgraph DAL[Data Access Layer]
    DAO[Data Access Objects]
    DB[(Database)]
    APIs[External APIs]
  end
  UI --> Controllers
  Controllers --> Services
  Controllers --> Models
  Services --> DAO
  DAO --> DB
  DAO --> APIs
```

## Design Patterns

### 1. **Model-View-Controller (MVC)**
- **Models**: Represent environmental data (carbon footprint, energy usage, waste tracking)
- **Views**: User interfaces for data input/visualization 
- **Controllers**: Handle user interactions and coordinate between models and views

### 2. **Observer Pattern**
- Perfect for real-time environmental data updates
- Notify users when thresholds are exceeded (e.g., high carbon footprint)
- Update dashboards automatically when new data is added

### 3. **Command Pattern**
- Implement undo/redo functionality for data entry
- Track user actions for audit purposes
- Useful for batch operations (bulk data import/export)

### 4. **Factory Pattern**
- Create different types of environmental trackers (energy, transportation, waste)
- Generate appropriate calculators based on data type
- Support multiple calculation methodologies

### 5. **Strategy Pattern**
- Different calculation algorithms for carbon footprint
- Multiple data export formats (PDF, CSV, JSON)
- Various visualization types (charts, graphs, reports)


### Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Header
    participant Web3Auth
    participant DB (actions.ts)

    User->>Header: Loads page
    Header->>Web3Auth: Initialize & check connection
    alt User not logged in
        User->>Header: Clicks "Login"
        Header->>Web3Auth: Initiate login
        Web3Auth-->>Header: Returns user info
        Header->>DB: createUser(email, name)
        DB-->>Header: User record
    end
    Header->>DB: getUserBalance(userId)
    DB-->>Header: Balance
    loop Every 30s
        Header->>DB: getUnreadNotifications(userId)
        DB-->>Header: Notifications
    end
    User->>Header: Clicks notification
    Header->>DB: markNotificationAsRead(notificationId)
    DB-->>Header: Confirmation
```

### Class Diagram
```mermaid
classDiagram
    %% Core Database Entities
    class User {
        +int id
        +string email
        +string name
        +timestamp createdAt
        +createUser(email: string, name: string)
        +getUserByEmail(email: string)
        +getUserBalance(userId: int)
    }

    class Report {
        +int id
        +int userId
        +string location
        +string wasteType
        +string amount
        +string imageUrl
        +jsonb verificationResult
        +string status
        +timestamp createdAt
        +int collectorId
        +submitReport()
        +verifyReport()
        +assignCollector()
    }

    class CollectedWaste {
        +int id
        +int reportId
        +int collectorId
        +timestamp collectionDate
        +string status
        +markAsCollected()
        +updateStatus()
    }

    class Reward {
        +int id
        +int userId
        +int points
        +timestamp createdAt
        +timestamp updatedAt
        +boolean isAvailable
        +string description
        +string name
        +string collectionInfo
        +calculateReward()
        +redeemReward()
    }

    class Notification {
        +int id
        +int userId
        +string message
        +string type
        +timestamp createdAt
        +boolean isRead
        +sendNotification()
        +markAsRead()
        +getUnreadNotifications()
    }

    class Transaction {
        +int id
        +int userId
        +string type
        +int amount
        +string description
        +timestamp date
        +recordEarning()
        +recordRedemption()
        +getTransactionHistory()
    }

    %% Core Business Logic Services
    class DatabaseActions {
        +createUser(email: string, name: string)
        +getUserByEmail(email: string)
        +getUnreadNotifications(userId: int)
        +getUserBalance(userId: int)
        +getRewardTransactions(userId: int)
        +markNotificationAsRead(notificationId: int)
    }

    class Web3AuthService {
        +IProvider provider
        +Web3AuthModal web3auth
        +UserInfo userInfo
        +initializeAuth()
        +login()
        +logout()
        +getUserInfo()
        +connectWallet()
    }

    class VerificationService {
        +verifyWasteImage(imageUrl: string)
        +processImageAnalysis()
        +generateVerificationResult()
        +calculateRewardPoints()
    }

    class NotificationService {
        +sendRealtimeNotification()
        +createSystemNotification()
        +broadcastToUsers()
        +scheduleReminders()
    }

    %% UI Components
    class Header {
        +boolean sidebarOpen
        +number totalEarnings
        +UserInfo userInfo
        +Notification notifications
        +number balance
        +handleLogin()
        +handleLogout()
        +toggleNotifications()
        +updateBalance()
    }

    class Button {
        +string variant
        +string size
        +boolean asChild
        +render()
    }

    class Badge {
        +string variant
        +render()
    }

    class DropdownMenu {
        +boolean open
        +ReactNode trigger
        +ReactNode content
        +handleSelect()
    }

    %% Layout and Pages
    class RootLayout {
        +boolean sidebarOpen
        +number totalEarnings
        +handleMenuClick()
        +render()
    }

    class HomePage {
        +render()
    }

    %% Utility Classes
    class MediaQueryHook {
        +string query
        +boolean matches
        +useMediaQuery()
    }

    class DatabaseConfig {
        +NeonDatabase db
        +initializeConnection()
    }

    class Utils {
        +cn()
        +clsx()
        +twMerge()
    }

    %% Relationships
    User "1" --> "many" Report : submits
    User "1" --> "many" Reward : earns
    User "1" --> "many" Notification : receives
    User "1" --> "many" Transaction : has
    User "1" --> "many" CollectedWaste : collects

    Report "1" --> "1" CollectedWaste : collected_as
    Report "many" --> "1" User : assigned_to_collector

    Reward "many" --> "1" User : belongs_to
    Transaction "many" --> "1" User : belongs_to
    Notification "many" --> "1" User : sent_to

    %% Service Dependencies
    DatabaseActions ..> User
    DatabaseActions ..> Notification
    DatabaseActions ..> Transaction

    Web3AuthService ..> User
    VerificationService ..> Report
    NotificationService ..> Notification

    %% UI Component Dependencies
    Header ..> Web3AuthService
    Header ..> DatabaseActions
    Header ..> NotificationService
    Header ..> Button
    Header ..> Badge
    Header ..> DropdownMenu

    RootLayout ..> Header
    HomePage ..> RootLayout

    %% Utility Dependencies
    Button ..> Utils
    Badge ..> Utils
    DropdownMenu ..> Utils
    Header ..> MediaQueryHook

    DatabaseActions ..> DatabaseConfig
```

### Summary

## Timeline and Development Plan 
## 📅 EcoTrack Development Timeline & Milestones

| **Milestone** | **Due Date** | **Phase** | **Deliverables** | **Status** | **Features** |
|---------------|--------------|-----------|------------------|------------|--------------|
| **Milestone 1** | **June 2, 2024** | **Technical Proof of Concept** | Minimal Working System | **COMPLETED** | • Web3Auth user authentication<br>• Basic home page & dashboard<br>• Waste reporting with image upload<br>• Database integration (PostgreSQL + Drizzle)<br>• Responsive UI components |
| **Milestone 2** | **June 30, 2024** | **Core Prototype** | Working System with Core Features | **NOT COMPLETED** | • AI-powered waste verification<br>• Rewards points system<br>• Real-time push notifications<br>• User balance tracking<br>• Report status management |
| **Milestone 3** | **July 28, 2024** | **Extended System** | Full-Featured Application | **NOT COMPLETED** | • Interactive leaderboard & achievements<br>• Admin dashboard & analytics<br>• System optimization & user testing<br>• Bug fixes & UX improvements<br>• Performance enhancements |

## 🚀 Feature Implementation Progress

### **Milestone 1 - Technical Proof of Concept** 
- **Authentication System**: Web3Auth integration with wallet-based login
- **Frontend Foundation**: Next.js 15 with TypeScript and Tailwind CSS
- **Database Layer**: PostgreSQL with Drizzle ORM, normalized schema
- **Core UI Components**: Responsive design with shadcn/ui components
- **Image Upload**: Integrated waste reporting with photo capture

### **Milestone 2 - Core Prototype** 
- **AI Verification**: Smart waste classification and validation system
- **Rewards Engine**: Point-based incentive system with balance tracking
- **Notification System**: Real-time updates for user actions and rewards
- **Data Management**: Comprehensive reporting and tracking features
- **User Experience**: Polished interface with loading states and error handling

### **Milestone 3 - Extended System** 
- **Gamification**: Leaderboard system with user rankings and achievements
- **Analytics Dashboard**: Admin interface for system monitoring and insights
- **Optimization**: Performance improvements and user feedback integration
- **Testing & Refinement**: Bug fixes, UX enhancements, and system stability
- **Mobile Responsiveness**: Cross-device compatibility and touch optimization

## Project Logging
https://docs.google.com/spreadsheets/d/1qt2mJ2I-7t5aVOVSAWLBEEHEN_XpdWWZP9iVdjLWB6Y/edit?gid=0#gid=0
