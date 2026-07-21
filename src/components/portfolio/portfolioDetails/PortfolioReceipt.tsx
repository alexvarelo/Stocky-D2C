import { forwardRef, useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

const mono = "'Courier New', 'Courier', monospace";

const fmt = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export interface ReceiptHolding {
  id?: string;
  ticker?: string;
  symbol?: string;
  quantity?: number;
  average_price?: number;
  avg_price?: number;
  current_price?: number;
  currentPrice?: number;
  total_value?: number;
  total_invested?: number;
}

interface PortfolioReceiptProps {
  portfolioName: string;
  portfolioDescription?: string;
  holdings: ReceiptHolding[];
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  todayChange: number;
  todayChangePercent: number;
  createdAt?: string;
}

const DashedLine = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    style={{
      borderBottom: "1.5px dashed #ccc",
      margin: "0",
    }}
  />
);

const StockRow = ({ holding, index }: { holding: ReceiptHolding; index: number }) => {
  const ticker = holding.ticker || holding.symbol || "???";
  const quantity = holding.quantity || 0;
  const avgPrice = holding.average_price || holding.avg_price || 0;
  const currentPrice = holding.current_price || holding.currentPrice || 0;
  const currentValue = holding.total_value || (quantity * currentPrice);
  const invested = holding.total_invested || (quantity * avgPrice);
  const gainLoss = currentValue - invested;
  const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 + index * 0.04, duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid #eee",
        fontFamily: mono,
      }}
    >
      <CompanyLogo ticker={ticker} size={28} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#111", letterSpacing: 0.5 }}>
          {ticker}
        </span>
        <div style={{ fontSize: 10, color: "#999", marginTop: 2, letterSpacing: 0.3 }}>
          {quantity} SHARES
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#111", letterSpacing: 0.3 }}>
          {currentPrice > 0 ? formatCurrency(currentValue) : "—"}
        </div>
        <div style={{ fontSize: 10, color: gainLoss >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600, marginTop: 2, letterSpacing: 0.3 }}>
          {currentPrice > 0 ? fmt(gainLossPercent) : "—"}
        </div>
      </div>
    </motion.div>
  );
};

const PrinterSlot = () => (
  <div style={{
    width: "100%",
    height: 52,
    background: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)",
    borderRadius: "14px 14px 0 0",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.08)",
  }}>
    <div style={{
      width: "75%",
      height: 6,
      background: "#111",
      borderRadius: 3,
      boxShadow: "inset 0 2px 3px rgba(0,0,0,0.7)",
    }} />
    <div style={{
      position: "absolute",
      right: 18,
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#10b981",
      boxShadow: "0 0 6px #10b981",
    }} />
  </div>
);

export const PortfolioReceipt = forwardRef<HTMLDivElement, PortfolioReceiptProps>(
  (
    {
      portfolioName,
      portfolioDescription,
      holdings,
      totalValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      todayChange,
      todayChangePercent,
      createdAt,
    },
    ref
  ) => {
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setShowReceipt(true), 200);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <PrinterSlot />

        <div style={{ overflow: "hidden", position: "relative", marginTop: -1 }}>
          <AnimatePresence>
            {showReceipt && (
              <motion.div
                ref={ref}
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  background: "#fff",
                  fontFamily: mono,
                  color: "#111",
                  position: "relative",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {/* Content */}
                <div style={{ padding: "32px 28px" }}>

                  {/* Portfolio Name */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    style={{ textAlign: "center", marginBottom: 24 }}
                  >
                    <div style={{
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}>
                      {portfolioName}
                    </div>
                    {portfolioDescription && (
                      <div style={{
                        fontSize: 10,
                        color: "#999",
                        marginTop: 8,
                        letterSpacing: 0.5,
                      }}>
                        {portfolioDescription}
                      </div>
                    )}
                  </motion.div>

                  {/* Meta info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#888",
                      letterSpacing: 1,
                      marginBottom: 20,
                      lineHeight: 1.8,
                    }}
                  >
                    {createdAt && (
                      <div>{new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase()}</div>
                    )}
                    <div>{holdings.length} HOLDING{holdings.length !== 1 ? "S" : ""}</div>
                  </motion.div>

                  <DashedLine delay={0.4} />

                  {/* Summary table */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                    style={{ padding: "16px 0" }}
                  >
                    {/* Header row */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#aaa",
                      letterSpacing: 1.5,
                      marginBottom: 12,
                      textTransform: "uppercase",
                    }}>
                      <span>ITEM</span>
                      <span>AMOUNT</span>
                    </div>

                    {[
                      { label: "TOTAL VALUE", value: formatCurrency(totalValue), color: "#333" },
                      { label: "INVESTED", value: formatCurrency(totalInvested), color: "#333" },
                      { label: "ALL-TIME RETURN", value: `${formatCurrency(totalReturn)}  ${fmt(returnPercentage)}`, color: totalReturn >= 0 ? "#16a34a" : "#dc2626" },
                      { label: "TODAY", value: `${formatCurrency(todayChange)}  ${fmt(todayChangePercent)}`, color: todayChange >= 0 ? "#16a34a" : "#dc2626" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 11,
                          padding: "6px 0",
                          color: "#333",
                          letterSpacing: 0.3,
                        }}
                      >
                        <span>{row.label}</span>
                        <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </motion.div>

                  <DashedLine delay={0.55} />

                  {/* Holdings section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.2 }}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#aaa",
                      letterSpacing: 1.5,
                      padding: "16px 0 8px",
                      textTransform: "uppercase",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>ASSET</span>
                    <span>VALUE</span>
                  </motion.div>

                  {holdings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 20, fontSize: 11, color: "#ccc" }}>
                      NO HOLDINGS
                    </div>
                  ) : (
                    holdings.map((holding, index) => (
                      <StockRow key={holding.ticker || holding.id || index} holding={holding} index={index} />
                    ))
                  )}

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + (holdings.length * 0.04), duration: 0.3 }}
                    style={{
                      textAlign: "center",
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1.5px dashed #ccc",
                    }}
                  >
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 2,
                      color: "#999",
                    }}>
                      STOCKFOLIO
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: "#ccc",
                      marginTop: 6,
                      letterSpacing: 0.5,
                    }}>
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase()}
                      {"  "}
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

PortfolioReceipt.displayName = "PortfolioReceipt";
