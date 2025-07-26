/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Coins,
  Recycle,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { IProvider } from "@web3auth/base";
import {
  createUser,
  getUnreadNotifications,
  markNotificationAsRead,
  getUserByEmail,
  getUserBalance,
} from "@/utils/db/actions";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const clientId =
  "BHDeNzbD7VTn_D12kGg0PmOndzjjgZSdNJTlqg7v-fXh1n3T75Z_D9qa2AF4IiSwtZJSYXK0KZ3wQyO-6JFR2fw";

interface Notification {
  id: number;
  type: string;
  message: string;
}

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: "sapphire_devnet",
});

interface headerProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: headerProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  interface UserInfo {
    email?: string;
    name?: string;
    [key: string]: unknown;
  }
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [balance, setBalance] = useState<number>(0);

  // Initialize Web3Auth early
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await web3auth.init();

        // Check if already connected
        if (web3auth.connected) {
          setLoggedIn(true);
          setProvider(web3auth.provider);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          localStorage.setItem("isLoggedIn", "true");

          if (user.email) {
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("isLoggedIn", "true");
            try {
              await createUser(user.email, user.name || "Anonymous user");
            } catch (error) {
              console.error("Error creating user:", error);
            }
          }
        }

        // Load avatar if available
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedAvatar) {
          setUserAvatar(savedAvatar);
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
        setLoggedIn(false);
        localStorage.removeItem("userEmail");
        localStorage.removeItem("isLoggedIn");
      } finally {
        setLoading(false);
      }
    };

    // Check local storage for login state
    const checkLoginState = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn) {
        setLoggedIn(true);
      }
    };

    init();
    checkLoginState();

    // Listen for avatar updates
    const handleAvatarUpdate = (event: CustomEvent) => {
      setUserAvatar(event.detail.avatarId);
    };

    window.addEventListener(
      "avatarUpdate",
      handleAvatarUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "avatarUpdate",
        handleAvatarUpdate as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications ?? []);
        }
      }
    };

    fetchNotifications();

    const notificationInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();

    // Add event listener for balance updates
    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener(
      "balanceUpdate",
      handleBalanceUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "balanceUpdate",
        handleBalanceUpdate as EventListener,
      );
    };
  }, [userInfo]);

  const login = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      if (web3authProvider) {
        setLoggedIn(true);
        const user = await web3auth.getUserInfo();
        setUserInfo(user);
        if (user.email) {
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("isLoggedIn", "true");
          try {
            await createUser(user.email, user.name || "Anonymous user");
          } catch (error) {
            console.error("Error creating user:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoggedIn(false);
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isLoggedIn");
      if (
        error instanceof Error &&
        error.message.includes("User closed modal")
      ) {
        console.log("User cancelled login");
        return;
      }
      alert(
        "Failed to login. Please try again and make sure popups are enabled.",
      );
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      setUserAvatar(null);
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("isLoggedIn");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous user");
        } catch (error) {
          console.error("Error creating user", error);
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    );
  };

  if (loading) {
    return <div className="flex justify-center">Loading Web3Auth...</div>;
  }

  return (
    <header className="eco-glass border-b border-green-200/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4 hover:bg-green-100/50"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6 text-green-700" />
          </Button>
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Recycle className="h-8 w-8 md:h-10 md:w-10 text-green-600 mr-2 md:mr-3 group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl eco-gradient-text">
                EcoTrack
              </span>
              <span className="text-[10px] md:text-xs text-green-600 -mt-1 font-medium">
                🌱 Clean Communities
              </span>
            </div>
          </Link>
        </div>
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations, waste types..."
                className="w-full px-5 py-3 bg-green-50/50 border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-300 placeholder-green-600/60"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">
                        {notification.message}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl px-3 md:px-4 py-2 border border-green-200 group hover:scale-105 transition-transform duration-300">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-600 group-hover:animate-spin" />
            <span className="font-bold text-sm md:text-base text-green-800">
              {balance.toFixed(2)}
            </span>
            <span className="text-xs text-green-600 ml-1">ECO</span>
          </div>
          {!loggedIn ? (
            <Button
              onClick={login}
              className="eco-button-primary text-sm md:text-base px-6"
            >
              🔑 Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center"
                >
                  {userAvatar ? (
                    <img
                      src={`/avatars/${userAvatar}.svg`}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full mr-1 object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 mr-1" />
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={getUserInfo}>
                  {userInfo ? userInfo.name : "Fetch User Info"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/avatar">Change Avatar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
