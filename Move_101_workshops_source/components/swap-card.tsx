"use client";

import { useState } from "react";
import { ChevronDown, ArrowDownUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlippageSettings } from "./slippage-settings";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";

export default function SwapCard() {
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);

  const [fromAmount, setFromAmount] = useState("0.0");
  const [toAmount, setToAmount] = useState("0.0");
  const [slippage, setSlippage] = useState(0.5);
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-lg bg-(--color-surface) rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-xl md:text-2xl font-semibold text-white">Swap</h3>
          <button
            onClick={() => setIsSlippageOpen(true)}
            className="flex items-center gap-2 text-(--color-text-secondary) text-sm hover:text-white transition-colors"
          >
            <span>{slippage}%</span>
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="bg-(--color-background) rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm text-(--color-text-secondary)">
                From
              </span>
            </div>

            <div className="flex items-center justify-between mb-2 gap-2">
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-2xl md:text-3xl font-semibold text-white outline-none w-full"
                placeholder="0.0"
              />

              <button className="flex items-center gap-1.5 md:gap-2 bg-(--color-surface) hover:bg-(--color-surface-hover) rounded-lg px-2 md:px-3 py-2 transition-colors flex-shrink-0">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-white font-medium text-sm md:text-base">
                  SUI
                </span>
                <ChevronDown className="w-4 h-4 text-(--color-text-secondary)" />
              </button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs md:text-sm text-(--color-text-muted)">
                $0.00
              </span>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-(--color-text-secondary)">
                  Balance: 0
                </span>
                <button className="text-(--color-primary) hover:text-(--color-primary-hover) font-medium">
                  50%
                </button>
                <button className="text-(--color-primary) hover:text-(--color-primary-hover) font-medium">
                  MAX
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button className="bg-(--color-surface) hover:bg-(--color-surface-hover) rounded-lg p-2 border-4 border-(--color-background) transition-colors">
              <ArrowDownUp className="w-5 h-5 text-(--color-text-secondary)" />
            </button>
          </div>

          <div className="bg-(--color-background) rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm text-(--color-text-secondary)">
                To
              </span>
            </div>

            <div className="flex items-center justify-between mb-2 gap-2">
              <input
                type="text"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="bg-transparent text-2xl md:text-3xl font-semibold text-white outline-none w-full"
                placeholder="0.0"
              />

              <button className="flex items-center gap-1.5 md:gap-2 bg-(--color-surface) hover:bg-(--color-surface-hover) rounded-lg px-2 md:px-3 py-2 transition-colors flex-shrink-0">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <span className="text-white font-medium text-sm md:text-base">
                  USDC
                </span>
                <ChevronDown className="w-4 h-4 text-(--color-text-secondary)" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-(--color-text-muted)">
                $0.00
              </span>
              <span className="text-xs md:text-sm text-(--color-text-secondary)">
                Balance: 0
              </span>
            </div>
          </div>
        </div>
        {currentAccount ? (
          <Button className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white rounded-xl py-5 md:py-6 mt-4 md:mt-6 text-base md:text-lg font-semibold">
            Swap
          </Button>
        ) : (
          <ConnectModal
            trigger={
              <Button className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white rounded-xl py-5 md:py-6 mt-4 md:mt-6 text-base md:text-lg font-semibold">
                Connect Wallet
              </Button>
            }
            open={open}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          ></ConnectModal>
        )}
      </div>

      {isSlippageOpen && (
        <SlippageSettings
          currentSlippage={slippage.toString()}
          onClose={() => setIsSlippageOpen(false)}
          onSave={(value) => {
            setSlippage(Number.parseFloat(value));
            setIsSlippageOpen(false);
          }}
        />
      )}
    </>
  );
}
