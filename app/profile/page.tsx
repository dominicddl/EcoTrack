/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { User, MapPin, Trash, Coins, Calendar, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { getUserByEmail, getRewardTransactions } from "@/utils/db/actions";

type Transaction = {
  id: number;
  type: "earned_report" | "earned_collect" | "redeemed";
  amount: number;
  description: string;
  date: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reportsSubmitted: 0,
    wasteCollected: 0,
    pointsEarned: 0,
    pointsRedeemed: 0,
  });

  useEffect(() => {
    // Listen for avatar updates
    const handleAvatarUpdate = (event: CustomEvent) => {
      setUserAvatar(event.detail.avatarId);
    };

    window.addEventListener(
      "avatarUpdate",
      handleAvatarUpdate as EventListener,
    );

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail);
          if (fetchedUser) {
            setUser(fetchedUser);

            // Get avatar from localStorage
            const savedAvatar = localStorage.getItem("userAvatar");
            if (savedAvatar) {
              setUserAvatar(savedAvatar);
            }

            const fetchedTransactions = await getRewardTransactions(
              fetchedUser.id,
            );
            setTransactions(fetchedTransactions as Transaction[]);

            // Calculate stats from transactions
            const stats = fetchedTransactions.reduce(
              (acc: any, transaction) => {
                if (transaction.type === "earned_report") {
                  acc.reportsSubmitted++;
                  acc.pointsEarned += transaction.amount;
                } else if (transaction.type === "earned_collect") {
                  acc.wasteCollected++;
                  acc.pointsEarned += transaction.amount;
                } else if (transaction.type === "redeemed") {
                  acc.pointsRedeemed += transaction.amount;
                }
                return acc;
              },
              {
                reportsSubmitted: 0,
                wasteCollected: 0,
                pointsEarned: 0,
                pointsRedeemed: 0,
              },
            );

            setStats(stats);
          } else {
            toast.error("User not found. Please log in.");
          }
        } else {
          toast.error("No user email found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      window.removeEventListener(
        "avatarUpdate",
        handleAvatarUpdate as EventListener,
      );
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            {userAvatar ? (
              <img
                src={`/avatars/${userAvatar}.svg`}
                alt="Avatar"
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <User className="h-12 w-12 text-green-600" />
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {user?.name || "User"}
            </h2>
            <p className="text-gray-600">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Activity Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={MapPin}
          title="Reports Submitted"
          value={stats.reportsSubmitted}
        />
        <StatCard
          icon={Trash}
          title="Waste Collected"
          value={stats.wasteCollected}
        />
        <StatCard
          icon={Coins}
          title="Points Earned"
          value={stats.pointsEarned}
        />
        <StatCard
          icon={Coins}
          title="Points Redeemed"
          value={stats.pointsRedeemed}
        />
      </div>

      {/* Recent Activity */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Recent Activity
      </h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center">
                {transaction.type === "earned_report" ? (
                  <MapPin className="w-5 h-5 text-green-500 mr-3" />
                ) : transaction.type === "earned_collect" ? (
                  <Trash className="w-5 h-5 text-blue-500 mr-3" />
                ) : (
                  <Coins className="w-5 h-5 text-red-500 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {transaction.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{transaction.date}</span>
                  </div>
                </div>
              </div>
              <span
                className={`font-semibold ${transaction.type.startsWith("earned") ? "text-green-500" : "text-red-500"}`}
              >
                {transaction.type.startsWith("earned") ? "+" : "-"}
                {transaction.amount}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No activity yet</div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex items-center mb-2">
        <div className="bg-green-100 p-2 rounded-full">
          <Icon className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="ml-2 text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
