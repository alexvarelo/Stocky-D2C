import type { Lesson } from "./types";

export const FUNDAMENTALS_BASICS_LESSONS: Lesson[] = [
  {
    id: "what-is-a-stock",
    trackId: "fundamentals-basics",
    order: 1,
    title: "What a stock is",
    summary: "A stock is a small ownership share in a company.",
    minutes: 4,
    body: `## What it is

A stock (or share) represents a small slice of ownership in a company. If a company has 1 million shares and you hold 1,000 of them, you own 0.1% of it. Companies issue shares to raise money for growth, and investors buy them hoping the business will grow in value and, in some cases, pay part of its profits as dividends.

Owning a share does not mean owning the company's assets directly. It means having a claim on what is left after the company pays its obligations, plus, usually, a vote on certain corporate decisions.

## How to read it

Shares trade on exchanges, where the price moves as buyers and sellers agree on a value. That price reflects what people collectively expect about the company's future earnings, risks and the wider economy, not a fixed "true" value. Two ideas are worth separating:

- The business: what the company earns, owns and owes.
- The price: what the market is willing to pay today for a share of that business.

They can drift apart for long periods. A great business can have a falling price, and a struggling one can have a rising price, at least for a while.

Returns from a stock come from two sources: price changes and dividends. Together they are called total return. Because prices fluctuate, the value of a holding can fall as well as rise, and you can lose part or all of the money invested.

For example, if a company with 100 million shares trades at 20 per share, the market values the whole company at 2 billion. That figure is its market capitalization, which the next lesson covers.

## Common mistake

A common mistake is treating the share price as a measure of how "cheap" or "expensive" a company is. A 10 share is not automatically cheaper than a 500 share. The price per share depends on how many shares exist, which the company can change through splits or new issues. To compare companies you need to look at value relative to earnings, sales or assets, not at the raw price.

Companies named in this course are illustrations only and are not recommendations.`,
    liveExample: {
      id: "price-snapshot",
      ticker: "AAPL",
      caption: "See the price of one share of an example company, its total market value and the number of shares they imply.",
    },
    glossaryIds: ["market-cap", "total-return", "eps"],
    quiz: [
      {
        id: "what-is-a-stock-q1",
        prompt: "What does owning a share of a company give you?",
        options: [
          "A fixed return guaranteed by the company",
          "A fractional ownership claim on the company",
          "A loan to the company that must be repaid",
          "Direct ownership of the company's buildings",
        ],
        correctIndex: 1,
        explanation:
          "A share is a slice of ownership. Unlike a loan, it has no guaranteed payment or repayment date, and your claim comes after the company's debts.",
      },
      {
        id: "what-is-a-stock-q2",
        prompt: "Company A trades at 10 per share and company B at 500. What can you conclude?",
        options: [
          "A is cheaper than B",
          "B is better than A",
          "Nothing about value, since the price depends on the number of shares",
          "A will rise more than B",
        ],
        correctIndex: 2,
        explanation:
          "Share price alone says nothing about value. You need to compare it with earnings, sales or assets per share, or look at total market capitalization.",
      },
      {
        id: "what-is-a-stock-q3",
        prompt: "Which are the two main sources of a stock's total return?",
        options: [
          "Price changes and dividends",
          "Interest and fees",
          "Taxes and inflation",
          "Volume and volatility",
        ],
        correctIndex: 0,
        explanation:
          "Total return combines the change in price with any dividends received. Ignoring dividends understates the return of companies that pay them.",
      },
    ],
  },
  {
    id: "market-cap-basics",
    trackId: "fundamentals-basics",
    order: 2,
    title: "Market cap: the size of a company",
    summary: "Market capitalization is the market's total value of a company's shares.",
    minutes: 4,
    body: `## What it is

Market capitalization, or market cap, is the total market value of a company's shares. You calculate it by multiplying the share price by the number of shares outstanding. If a company has 50 million shares and each trades at 40, its market cap is 2 billion.

Market cap measures the size of a company as the market values it today. It is not the same as the company's revenue, profit or book value.

## How to read it

Investors often group companies by size. Common rough bands are large caps (above about 10 billion), mid caps (about 2 to 10 billion) and small caps (below about 2 billion). The exact thresholds vary by source and over time.

Size tends to be related to certain characteristics:

- Larger companies are usually more established and their prices often move less sharply, though this is not a rule.
- Smaller companies may have more room to grow, but they often have less diversified revenue, less trading volume and a higher chance of large price swings.

Market cap is also a building block. Enterprise value starts from market cap and adjusts for debt and cash, giving a fuller picture of what it would cost to buy the whole business. Many stock indices weight their components by market cap, so the biggest companies have the largest influence on the index.

For example, if two companies both earn 100 million a year but one has a market cap of 1 billion and the other 3 billion, the market is paying a different price for each unit of profit. That difference is the starting point of valuation analysis.

## Common mistake

Confusing market cap with what a company is "worth" in an absolute sense. Market cap changes every second with the price and says nothing by itself about whether that price is reasonable. Another frequent error is ignoring share count changes: if a company issues many new shares, its market cap can grow without the price rising at all.

Tickers mentioned are illustrations, not recommendations.`,
    liveExample: {
      id: "price-snapshot",
      ticker: "AAPL",
      caption: "See the share price and market cap of an example ticker, and the number of shares they imply.",
    },
    glossaryIds: ["market-cap", "enterprise-value", "price-to-sales"],
    quiz: [
      {
        id: "market-cap-basics-q1",
        prompt: "How is market capitalization calculated?",
        options: [
          "Revenue multiplied by profit margin",
          "Share price multiplied by shares outstanding",
          "Total assets minus total debt",
          "Net profit divided by the share price",
        ],
        correctIndex: 1,
        explanation:
          "Market cap is simply the price of one share times the number of shares in circulation, so it reflects what the market currently pays for the whole equity.",
      },
      {
        id: "market-cap-basics-q2",
        prompt: "A company issues many new shares at the same price. What happens to its market cap?",
        options: [
          "It stays exactly the same",
          "It falls automatically",
          "It rises, because there are more shares",
          "It cannot be calculated",
        ],
        correctIndex: 2,
        explanation:
          "More shares at the same price means a higher market cap. This is why a bigger market cap does not always mean the business became more valuable per share.",
      },
      {
        id: "market-cap-basics-q3",
        prompt: "Why is market cap not enough to judge if a company is expensive?",
        options: [
          "Because it is updated only once a year",
          "Because it ignores the share price",
          "Because it does not relate value to earnings, sales or debt",
          "Because it only applies to small companies",
        ],
        correctIndex: 2,
        explanation:
          "Market cap is a size measure. To judge price relative to fundamentals you compare it with earnings, sales or cash flow, and adjust for debt using enterprise value.",
      },
    ],
  },
  {
    id: "how-returns-compound",
    trackId: "fundamentals-basics",
    order: 3,
    title: "How returns compound",
    summary: "Gains build on previous gains, and losses are harder to recover than they look.",
    minutes: 5,
    body: `## What it is

Compounding means earning returns on your earlier returns. If an investment grows 10% in the first year, the second year's 10% applies to a larger amount. Over long periods this snowball effect can become large, which is why time is such an important factor in investing.

A simple illustration: 1,000 growing at 7% a year becomes about 1,070 after one year, about 1,225 after three, and about 1,967 after ten. The gain in the last years is bigger than in the first ones, even though the rate is the same.

## How to read it

Two measures help describe compounding:

- Annual return: the percentage change over one year.
- CAGR (compound annual growth rate): the constant yearly rate that would take you from the start value to the end value. It smooths out ups and downs into one comparable number.

Returns in real life are not constant. An investment that gains 50% and then loses 50% does not return to the start: 100 becomes 150, then 75. Percentage losses need a larger percentage gain to recover. A 20% loss needs a 25% gain, and a 50% loss needs a 100% gain.

For this reason, the average of yearly returns can be misleading. Two investments with the same arithmetic average can end up at very different values depending on how volatile the path was. CAGR captures the actual result of compounding.

Costs and taxes also compound, but against you. A small yearly fee reduces the base that grows in every following year.

The calculator below uses hypothetical rates that you choose. Historical returns are not a guarantee, and past performance does not predict future results.

## Common mistake

Assuming a historical average return will repeat smoothly. Markets can go through long flat or negative periods, and the order of returns matters, especially when you add or withdraw money. Another mistake is ignoring the effect of large losses: protecting against deep drawdowns matters because the math of recovery is asymmetric.`,
    liveExample: {
      id: "compound-growth",
      caption: "An illustration with your own assumptions, not market data: change the rate, time, contributions and yearly fee to see how compounding and costs play out.",
    },
    glossaryIds: ["cagr", "annual-return", "total-return"],
    quiz: [
      {
        id: "how-returns-compound-q1",
        prompt: "An investment falls 50%. What gain is needed to get back to the starting value?",
        options: ["50%", "75%", "100%", "25%"],
        correctIndex: 2,
        explanation:
          "After a 50% fall, 100 becomes 50. To return to 100 you must double it, which is a 100% gain. Losses require proportionally bigger gains to recover.",
      },
      {
        id: "how-returns-compound-q2",
        prompt: "What does CAGR represent?",
        options: [
          "The best year of an investment",
          "The simple average of yearly returns",
          "The constant yearly rate that links the start and end values",
          "The total fees paid",
        ],
        correctIndex: 2,
        explanation:
          "CAGR is the steady annual rate that would produce the same final result, which accounts for compounding and the effect of volatility.",
      },
      {
        id: "how-returns-compound-q3",
        prompt: "Why can a small yearly fee matter a lot over decades?",
        options: [
          "Fees are only charged once",
          "Fees reduce the base that compounds in every following year",
          "Fees increase the return",
          "Fees are always refunded",
        ],
        correctIndex: 1,
        explanation:
          "A recurring cost lowers the capital that earns returns each year, so its effect accumulates the same way gains do.",
      },
    ],
  },
  {
    id: "dividends",
    trackId: "fundamentals-basics",
    order: 4,
    title: "Dividends",
    summary: "Some companies share part of their profits with shareholders in cash.",
    minutes: 4,
    body: `## What it is

A dividend is a payment a company makes to its shareholders, usually in cash and usually from profits. Not every company pays one. Some reinvest all their earnings in the business, while others distribute a regular part of them. Dividends are decided by the company's board and can be raised, cut or suspended.

## How to read it

Three measures help you understand a dividend:

- Dividend yield: the yearly dividend per share divided by the share price. If a share trades at 50 and pays 2 per year, the yield is 4%.
- Payout ratio: the share of earnings paid out as dividends. If a company earns 4 per share and pays 2, the payout ratio is 50%. A very high ratio can leave little room to absorb a bad year.
- Ex-dividend date: you must own the shares before this date to receive the next dividend. On that date the share price typically adjusts down by roughly the dividend amount, because that cash leaves the company.

That last point shows an important idea: a dividend is not free money added on top of the investment. The value paid out comes from the company, so the share price adjusts. What matters is total return, which adds dividends to price changes.

A high yield can have different causes. It may reflect a generous payout from a stable business, or it may be high simply because the price has fallen, sometimes because the market expects the dividend to be cut. The yield alone cannot tell these apart, so context such as earnings, cash flow and debt is needed.

Dividends may also be taxed differently depending on your country, so check the rules that apply to you.

## Common mistake

Judging a stock only by its yield. A high dividend yield can be a warning sign as well as a feature, and a company with no dividend can still deliver strong returns through growth. Compare dividends with free cash flow and the payout ratio before drawing conclusions. Examples are illustrations, not recommendations.`,
    liveExample: {
      id: "dividend-yield",
      ticker: "KO",
      caption: "See the dividend yield an example company reports today, and the yearly dividend per share it implies. Some companies pay nothing.",
    },
    glossaryIds: ["dividend-yield", "payout-ratio", "ex-dividend-date"],
    quiz: [
      {
        id: "dividends-q1",
        prompt: "A share trades at 80 and pays 4 per year in dividends. What is the dividend yield?",
        options: ["2%", "5%", "4%", "20%"],
        correctIndex: 1,
        explanation: "Yield is the annual dividend divided by the price: 4 / 80 = 5%.",
      },
      {
        id: "dividends-q2",
        prompt: "What usually happens to the share price on the ex-dividend date?",
        options: [
          "It adjusts down by roughly the dividend amount",
          "It doubles",
          "It is frozen for a year",
          "It rises by the dividend amount",
        ],
        correctIndex: 0,
        explanation:
          "The cash paid out leaves the company, so its value per share falls by about that amount. A dividend is a transfer of value, not extra value.",
      },
      {
        id: "dividends-q3",
        prompt: "Why can a very high yield be a warning sign?",
        options: [
          "Because yield is capped by law",
          "Because high yields mean low taxes",
          "It may be high because the price fell, and the dividend might not be sustainable",
          "Because it guarantees future growth",
        ],
        correctIndex: 2,
        explanation:
          "Yield rises when the price falls. If the market expects trouble, the yield can look attractive while the dividend is at risk of being cut.",
      },
    ],
  },
  {
    id: "index-funds-etfs",
    trackId: "fundamentals-basics",
    order: 5,
    title: "Index funds and ETFs",
    summary: "Funds that hold many securities at once, usually following an index.",
    minutes: 5,
    body: `## What it is

An index is a list of securities used to describe a market, such as a basket of large companies from one country. You cannot buy an index directly, but an index fund or an ETF (exchange-traded fund) can hold the same securities, so that its value follows the index.

An ETF trades on an exchange during the day like a stock. A traditional index fund is usually bought and sold at a price set once per day. Both give exposure to many companies through a single holding.

## How to read it

When you look at a fund, a few facts matter more than its name:

- What it tracks: which index, which markets, which sectors.
- How it weights holdings: many indices weight by market cap, so a few very large companies can make up a big share of the fund.
- Its costs: the ongoing charge (often called expense ratio) and, for ETFs, the spread you pay when trading.
- How it replicates: by holding the securities directly or by using derivatives.
- Its currency and whether it distributes dividends or reinvests them.

Funds that track an index follow it passively. This usually means lower costs than funds where managers pick investments, but it also means the fund will fall when its index falls. Holding a fund spreads risk across many companies, yet it does not remove market risk.

For example, an ETF tracking a broad index of 500 companies reduces the impact of any single company failing, but it is still exposed to the overall movement of that market.

Tickers or indices cited in this course are illustrations only.

## Common mistake

Assuming that "diversified" automatically means "low risk", or that a fund with many holdings is spread out evenly. Check what is inside: a fund can be concentrated in one sector or in a handful of companies. Another mistake is comparing funds only by past performance, when costs, structure and what they hold are more informative, and past performance does not predict future results.`,
    liveExample: {
      id: "etf-vs-stock",
      ticker: "TSLA",
      caption: "Compare the volatility and largest fall of one example stock with SPY, a fund that tracks the S&P 500.",
    },
    glossaryIds: ["benchmark", "diversification", "total-return"],
    quiz: [
      {
        id: "index-funds-etfs-q1",
        prompt: "What is the main idea of an index fund?",
        options: [
          "To beat the market by picking winners",
          "To hold the securities of an index so its value follows it",
          "To guarantee a fixed return",
          "To invest only in one company",
        ],
        correctIndex: 1,
        explanation:
          "An index fund replicates an index. It aims to match its movement, not to outperform it, and it has no guarantee against losses.",
      },
      {
        id: "index-funds-etfs-q2",
        prompt: "An index weighted by market cap has a few huge companies. What does that imply?",
        options: [
          "All holdings affect it equally",
          "Those few companies have a large influence on the fund's result",
          "The fund is risk free",
          "The fund cannot fall",
        ],
        correctIndex: 1,
        explanation:
          "In a cap-weighted index, bigger companies get bigger weights, so a handful can drive a large share of performance.",
      },
      {
        id: "index-funds-etfs-q3",
        prompt: "Which fact is most useful when comparing two funds that track similar indices?",
        options: [
          "The fund's name",
          "The color of its logo",
          "Its ongoing costs and how it is structured",
          "Last year's return alone",
        ],
        correctIndex: 2,
        explanation:
          "If two funds follow similar indices, costs and structure explain much of the difference in results. Last year's return does not predict the next one.",
      },
    ],
  },
  {
    id: "diversification-basics",
    trackId: "fundamentals-basics",
    order: 6,
    title: "Diversification",
    summary: "Spreading money across different holdings reduces the impact of any single one.",
    minutes: 5,
    body: `## What it is

Diversification means spreading your money across different investments so that no single one decides your overall result. The idea is often summed up as not putting all your eggs in one basket. If one holding falls sharply, the others may soften the impact.

Diversification works across several dimensions: companies, sectors, countries, asset types and sometimes time. Owning ten companies in the same sector is less diversified than owning ten companies in ten different sectors.

## How to read it

The benefit comes from holdings that do not always move together. Their relationship is measured by correlation, a number between -1 and 1. Lower correlation between holdings generally means more diversification benefit.

Ways to gauge how spread out a portfolio really is:

- Weight of the largest positions: if one holding is 40% of the portfolio, it dominates the outcome.
- Effective number of positions: a portfolio of 20 holdings where two make up most of the weight behaves like one with far fewer.
- Sector and country exposure: concentration in one theme is a hidden risk.

Diversification reduces the risk specific to a single company, such as a failed product or an accounting scandal. It does not remove market risk, the risk that everything falls together. In severe market stress, correlations between many assets tend to rise, so the protection can be weaker exactly when you want it.

There is also a cost: a diversified portfolio will not capture the full gain of the single best performer. That is a trade-off, not a flaw.

Use the calculator to see how the number of holdings and their correlation change volatility under assumptions you choose. It is an illustration and not personal advice.

## Common mistake

Confusing number of holdings with diversification. Owning many positions that all react to the same factor, such as interest rates or one technology theme, gives less protection than it appears. Another mistake is thinking diversification guarantees no losses. It reduces the odds that one event does major damage; it does not eliminate risk.`,
    liveExample: {
      id: "diversification",
      caption: "An illustration with your own assumptions, not market data: see how portfolio volatility changes with the number of equal-sized holdings and how correlated they are.",
    },
    glossaryIds: ["diversification", "correlation", "concentration-hhi", "effective-positions"],
    quiz: [
      {
        id: "diversification-basics-q1",
        prompt: "Which portfolio is likely better diversified?",
        options: [
          "Ten companies from the same sector",
          "Ten companies from different sectors and countries",
          "One company with 100% weight",
          "Two companies that always move together",
        ],
        correctIndex: 1,
        explanation:
          "Diversification depends on holdings not moving together. Different sectors and countries respond to different drivers.",
      },
      {
        id: "diversification-basics-q2",
        prompt: "What type of risk does diversification mainly reduce?",
        options: [
          "Risk of the whole market falling",
          "Risk specific to a single company",
          "Inflation risk",
          "All risk",
        ],
        correctIndex: 1,
        explanation:
          "Company-specific events affect only part of a diversified portfolio. Market-wide risk affects nearly everything and cannot be diversified away.",
      },
      {
        id: "diversification-basics-q3",
        prompt: "A portfolio has 20 stocks, but two represent 70% of its value. What does this show?",
        options: [
          "It is highly diversified because it has 20 stocks",
          "Its real diversification is lower than the count suggests",
          "It cannot lose money",
          "Weights do not matter",
        ],
        correctIndex: 1,
        explanation:
          "Weights determine influence. With two positions dominating, the portfolio behaves like a much more concentrated one.",
      },
    ],
  },
  {
    id: "fees-and-costs",
    trackId: "fundamentals-basics",
    order: 7,
    title: "Fees and costs",
    summary: "Small recurring costs reduce returns more than they appear to.",
    minutes: 4,
    body: `## What it is

Every investment has costs, and they reduce what you keep. Costs do not depend on whether markets go up or down, so they are one of the few things an investor can observe and compare in advance.

The main types are:

- Ongoing fund fees, often shown as the expense ratio or ongoing charge, taken from the fund's assets each year.
- Trading commissions charged by a broker for buying and selling.
- The bid-ask spread: the small gap between the price to buy and the price to sell, which matters more for less traded securities.
- Currency conversion costs when you invest in another currency.
- Taxes on dividends and on gains, which depend on your country and situation.

## How to read it

A cost of 1% a year may sound small, but it applies every year to a growing balance. Suppose an investment would grow 6% a year before costs. After costs of 1%, it grows 5%. Over 30 years, 1,000 becomes about 5,743 at 6% and about 4,322 at 5%. The difference of more than 1,400 comes from one percentage point.

When comparing products, consider the total cost of ownership rather than a single line. A fund with a low ongoing charge but a wide spread, or an account with free trades but poor currency conversion, may not be cheaper overall. Frequent trading multiplies commissions, spreads and potential taxes.

Costs are certain, while returns are not. That is why many investors pay attention to them, though lower cost does not by itself make an investment suitable or better. Quality, risk and fit with your goals still matter.

The figures here are hypothetical examples, not predictions.

## Common mistake

Ignoring costs because they look small in percentage terms or are not shown as a separate bill. Many fees are deducted inside the fund price, so you never see an invoice. Another mistake is looking only at the headline fee and overlooking spreads, currency charges and taxes.`,
    liveExample: {
      id: "compound-growth",
      caption: "An illustration with your own assumptions, not market data: set a yearly fee and compare the balance with and without it.",
    },
    glossaryIds: ["annual-return", "cagr", "total-return"],
    quiz: [
      {
        id: "fees-and-costs-q1",
        prompt: "Why does a 1% yearly fee matter over 30 years?",
        options: [
          "It is charged only once",
          "It applies every year and reduces the amount that compounds",
          "It increases returns",
          "It only affects dividends",
        ],
        correctIndex: 1,
        explanation:
          "A recurring cost compounds like a negative return, so its effect keeps growing as the balance and time increase.",
      },
      {
        id: "fees-and-costs-q2",
        prompt: "What is the bid-ask spread?",
        options: [
          "A yearly management fee",
          "The gap between the buying and selling price",
          "A tax on dividends",
          "The difference between two funds",
        ],
        correctIndex: 1,
        explanation:
          "The spread is the difference between the highest price a buyer offers and the lowest price a seller accepts. It is a real cost every time you trade.",
      },
      {
        id: "fees-and-costs-q3",
        prompt: "Which statement is accurate?",
        options: [
          "The lowest-cost product is always the best choice",
          "Costs are uncertain, returns are certain",
          "Costs are known in advance, but they are only one factor among others",
          "Costs do not matter if returns are positive",
        ],
        correctIndex: 2,
        explanation:
          "Costs are relatively predictable and worth comparing, but suitability, risk and quality also count.",
      },
    ],
  },
  {
    id: "reading-a-price-chart",
    trackId: "fundamentals-basics",
    order: 8,
    title: "Reading a price chart",
    summary: "Understand candles, scales and time ranges before interpreting any chart.",
    minutes: 5,
    body: `## What it is

A price chart shows how the price of a security changed over time. The horizontal axis is time and the vertical axis is price. It is the most common way to see history, and it is the base for technical analysis.

There are two common styles. A line chart connects closing prices. A candlestick chart summarizes each period with four values: open, high, low and close. The body of a candle spans open to close, and thin lines called wicks show the highest and lowest prices of the period. By convention the color shows whether the close was above or below the open, although colors differ between platforms.

## How to read it

Before interpreting a chart, check these settings:

- Time range and interval: one candle may represent a minute, a day or a month. The same security can look calm over five years and wild over one day.
- Scale: a linear scale shows equal price steps, while a logarithmic scale shows equal percentage steps, which is better for long periods because a move from 10 to 20 and from 100 to 200 look alike.
- Adjustments: prices adjusted for splits and dividends give a truer picture of returns than raw prices.
- Volume: the bars at the bottom show how many shares traded, which gives context about how much participation was behind a move.

A chart tells you what happened, not what will happen. A price that rose steadily says nothing guaranteed about the next period, and past performance does not predict future results. Charts are a tool for understanding behavior, such as how volatile a price has been or how deep past falls were.

The example ticker is an illustration, not a recommendation.

## Common mistake

Zooming into a short window and drawing big conclusions. A few days of data can show a dramatic move that is small in the longer picture, and the reverse is also true. Another mistake is forgetting that charts are drawn after the fact, so patterns that look obvious in hindsight were uncertain at the time.`,
    liveExample: {
      id: "volume",
      ticker: "MSFT",
      caption: "See an example stock's volume and average volume over the last year. The Technicals tab of any stock lets you change the period.",
    },
    glossaryIds: ["volume", "volatility", "max-drawdown"],
    quiz: [
      {
        id: "reading-a-price-chart-q1",
        prompt: "What does a candlestick summarize for each period?",
        options: [
          "Only the closing price",
          "Open, high, low and close",
          "Revenue and profit",
          "The dividend",
        ],
        correctIndex: 1,
        explanation:
          "Each candle packs four prices: where the period began, its highest and lowest points and where it ended.",
      },
      {
        id: "reading-a-price-chart-q2",
        prompt: "When is a logarithmic scale especially helpful?",
        options: [
          "To compare percentage moves over long periods",
          "To hide volatility",
          "To predict future prices",
          "To remove dividends",
        ],
        correctIndex: 0,
        explanation:
          "A log scale gives equal vertical distance to equal percentage changes, so growth looks proportional across years even when the price level changes a lot.",
      },
      {
        id: "reading-a-price-chart-q3",
        prompt: "What is the main risk of judging a security from a very short chart window?",
        options: [
          "Charts do not work in the short term",
          "Short windows exaggerate moves that may be minor in context",
          "Short windows hide the current price",
          "It is illegal",
        ],
        correctIndex: 1,
        explanation:
          "A short window lacks context, so ordinary fluctuations can look like big trends. Check several time ranges.",
      },
    ],
  },
];
