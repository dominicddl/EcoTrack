"use client";
import { Recycle, Users, Coins, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

import Link from "next/link";

//makes the special animation for our icon, 4 different divs for each "bounce"
//can remove if you want a static icon @dom
function AnimatedIcon() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      {/* <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div> */}
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Recycle className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Environmental Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20">
        <div className="absolute inset-0 eco-pattern opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                🌱 AI-Powered Waste Management
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="eco-gradient-text">EcoTrack</span>
                <br />
                <span className="text-gray-800">Clean Communities</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl leading-relaxed mb-8">
                Transform waste management with AI verification, community rewards, and real-time tracking. Join the movement for cleaner neighborhoods.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/report">
                  <Button className="eco-button-primary text-lg py-6 px-8 w-full sm:w-auto">
                    🗑️ Report Waste
                  </Button>
                </Link>
                <Link href="/collect">
                  <Button className="eco-button-secondary text-lg py-6 px-8 w-full sm:w-auto">
                    ♻️ Collect & Earn
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto">
                <AnimatedIcon />
                <div className="absolute -top-4 -right-4 bg-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                  AI Verified!
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-400 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  Earn Rewards
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 eco-gradient-text">How EcoTrack Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to make your community cleaner and earn rewards
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Recycle}
            title="AI-Powered Detection"
            description="Upload waste photos and let our Gemini AI instantly classify waste type and quantity with high accuracy."
            step="1"
            color="green"
          />
          <FeatureCard
            icon={Coins}
            title="Earn & Redeem"
            description="Get rewarded with tokens for every report and collection. Redeem for eco-friendly products and vouchers."
            step="2"
            color="orange"
          />
          <FeatureCard
            icon={Users}
            title="Community Impact"
            description="Track your environmental impact and compete with neighbors on leaderboards for cleaner communities."
            step="3"
            color="blue"
          />
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 py-20 mx-4 rounded-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-white">
            Community Impact Dashboard
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <ImpactCard title="Waste Collected" value={"20 Kg"} icon={Recycle} />
            <ImpactCard title="Reports Verified" value={50} icon={MapPin} />
            <ImpactCard title="Tokens Distributed" value={100} icon={Coins} />
            <ImpactCard title="CO₂ Offset" value={"50 Kg"} icon={Recycle} />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="eco-glass p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in making our community cleaner, one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button className="eco-button-primary text-lg py-4 px-8">
                Start Reporting Now
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline" className="text-lg py-4 px-8 border-2 border-green-600 text-green-600 hover:bg-green-50">
                View Rewards
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  step,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  step: string;
  color: 'green' | 'orange' | 'blue';
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600 border-green-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
  };
  
  const stepColors = {
    green: 'bg-green-500',
    orange: 'bg-orange-500', 
    blue: 'bg-blue-500',
  };

  return (
    <div className="eco-card p-8 flex flex-col items-center text-center relative group">
      <div className={`absolute -top-3 -right-3 ${stepColors[color]} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}>
        {step}
      </div>
      <div className={`${colorClasses[color]} p-6 rounded-2xl mb-6 border-2 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-10 w-10"></Icon>
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ImpactCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-3xl p-6 text-center group hover:scale-105 transition-all duration-300 shadow-lg">
      <Icon className="h-12 w-12 text-green-600 mb-4 mx-auto group-hover:animate-bounce" />
      <p className="text-4xl font-bold mb-2 text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}