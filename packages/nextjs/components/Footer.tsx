"use client";

import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import {
  CodeBracketIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <footer className="bg-card">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-2xl font-bold text-foreground">Crypto Savings Vault</h3>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Decentralized savings platform with dynamic interest rates. Earn on your crypto assets with automated
              smart contracts.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <CodeBracketIcon className="h-5 w-5 text-foreground" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Discord"
              >
                <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C2.601 6.7 2.216 9.044 2.055 11.38a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c-.15-2.38-.526-4.723-1.259-7.013a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Product</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/debug" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Interest Rates
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">Resources</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://docs.tellor.io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <CodeBracketIcon className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  Security
                </a>
              </li>
              {isLocalNetwork && (
                <li>
                  <Link
                    href="/blockexplorer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Block Explorer
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Crypto Savings Vault</span>
              <span>·</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <span>·</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
            </div>

            <div className="flex items-center gap-4">
              {nativeCurrencyPrice > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background">
                  <CurrencyDollarIcon className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-semibold">${nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              )}
              {isLocalNetwork && <Faucet />}
              <SwitchTheme />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
