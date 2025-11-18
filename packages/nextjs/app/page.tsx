"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  const features = [
    {
      icon: BoltIcon,
      title: "Lightning Fast",
      description: "Transactions settle instantly with optimized smart contract execution and minimal gas fees.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Security First",
      description: "Audit-proven smart contracts, non-custodial design, and industry-leading security standards.",
    },
    {
      icon: ChartBarIcon,
      title: "Dynamic Rates",
      description: "Interest rates automatically adjust based on real-time Bitcoin prices and market conditions.",
    },
    {
      icon: LockClosedIcon,
      title: "Non-Custodial",
      description: "You maintain full control of your assets. We never hold your keys—your wallet, your crypto.",
    },
  ];

  const benefits = [
    "Up to 5% annual interest rate",
    "100% decentralized and transparent",
    "No KYC or registration required",
    "Instant deposits and withdrawals",
    "Automated rate adjustments",
    "24/7 availability worldwide",
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">Crypto Savings Vault</h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Earn dynamic interest rates on your crypto assets. Decentralized savings with automated rate
                adjustments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isConnected ? (
                <Link
                  href="/debug"
                  className="px-8 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  Start Saving Now <ArrowRightIcon className="w-4 h-4" />
                </Link>
              ) : (
                <div className="[&_button]:!px-8 [&_button]:!py-3 [&_button]:!bg-accent [&_button]:hover:!bg-accent/90 [&_button]:!text-accent-foreground [&_button]:!rounded-lg [&_button]:!font-semibold [&_button]:!transition-colors">
                  <RainbowKitCustomConnectButton />
                </div>
              )}
              <Link href="/debug" className="px-8 py-3 hover:bg-background rounded-lg font-semibold transition-colors">
                Learn More
              </Link>
            </div>

            <p className="text-sm text-muted-foreground pt-4">No credit card required. Full access to all features.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features for Crypto Savers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to grow your crypto savings securely
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-background p-6 rounded-lg transition-colors group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Visual placeholder */}
            <div className="relative h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-40 h-40 border-4 border-primary/30 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-muted-foreground text-center z-10">Crypto Savings Platform</p>
            </div>

            {/* Right side - Benefits list */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-bold">Why Choose Our Platform?</h2>
                <p className="text-lg text-muted-foreground">
                  Built for transparency and security. Everything optimized for your success.
                </p>
              </div>
              <div className="grid gap-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start earning interest in just 4 simple steps
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Connect Your Wallet",
                desc: "Use Reown (AppKit) to securely connect your crypto wallet. No registration, no KYC—just connect and go.",
              },
              {
                num: 2,
                title: "Deposit Your Tokens",
                desc: "Deposit your ERC20 tokens into the smart contract. Your funds are locked securely and start earning interest immediately.",
              },
              {
                num: 3,
                title: "Earn Interest Automatically",
                desc: "The smart contract automatically calculates your interest rate based on market conditions. Watch your savings grow!",
              },
              {
                num: 4,
                title: "Withdraw Anytime",
                desc: "Withdraw your principal plus earned interest whenever you need. No penalties, no waiting—just instant access to your funds.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-6 items-start bg-background rounded-lg p-6 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Rates Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Dynamic Interest Rates</h2>
            <p className="text-lg text-muted-foreground">
              Rates adjust automatically based on Bitcoin market conditions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background rounded-lg p-8 transition-colors">
              <div className="text-5xl font-bold text-primary mb-4">5% APY</div>
              <h3 className="text-2xl font-bold mb-3">When BTC &lt; $30,000</h3>
              <p className="text-muted-foreground leading-relaxed">
                Higher interest rates when Bitcoin is below $30,000, giving you better returns during market dips.
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 transition-colors">
              <div className="text-5xl font-bold text-secondary mb-4">2% APY</div>
              <h3 className="text-2xl font-bold mb-3">When BTC ≥ $30,000</h3>
              <p className="text-muted-foreground leading-relaxed">
                Competitive rates when Bitcoin is above $30,000, still better than most traditional savings accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8 bg-card/50 rounded-2xl p-8 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Ready to build the next generation of savings?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the decentralized savings revolution. Connect your wallet and start earning interest today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isConnected ? (
              <Link
                href="/debug"
                className="px-8 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Go to Dashboard <ArrowRightIcon className="w-4 h-4" />
              </Link>
            ) : (
              <div className="[&_button]:!px-8 [&_button]:!py-3 [&_button]:!bg-accent [&_button]:hover:!bg-accent/90 [&_button]:!text-accent-foreground [&_button]:!rounded-lg [&_button]:!font-semibold [&_button]:!transition-colors">
                <RainbowKitCustomConnectButton />
              </div>
            )}
            <Link href="/debug" className="px-8 py-3 hover:bg-background rounded-lg font-semibold transition-colors">
              Schedule a Demo
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required. Full access to all features.</p>
        </div>
      </section>
    </>
  );
};

export default Home;
