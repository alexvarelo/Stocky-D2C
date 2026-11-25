import type { Lesson } from "./types";

export const FUNDAMENTAL_ANALYSIS_LESSONS: Lesson[] = [
  {
    id: "income-statement",
    trackId: "fundamental-analysis",
    order: 1,
    title: "The income statement",
    summary: "How a company turns revenue into profit, line by line.",
    minutes: 5,
    body: `## What it is

The income statement shows a company's results over a period, usually a quarter or a year. It starts with revenue (sales) at the top and subtracts costs step by step until it reaches net income, the profit that belongs to shareholders. That is why net income is called the bottom line.

A simplified structure:

- Revenue: money from selling products or services.
- Cost of goods sold: direct costs of producing what was sold. Revenue minus this is gross profit.
- Operating expenses: selling, administration, research and similar costs. Gross profit minus these is operating income.
- Interest and taxes: financing costs and income taxes.
- Net income: what is left. Divided by the number of shares, it gives earnings per share (EPS).

## How to read it

Look at the direction and the quality of each line, not just the last one:

- Is revenue growing, and how fast? Compare several periods, not only the latest.
- Do costs grow slower or faster than revenue? If costs outpace sales, profitability shrinks.
- Is net income affected by one-off items such as asset sales, write-downs or tax effects? These can make a single year look unusually good or bad.
- Has the number of shares changed? EPS can fall even when net income rises if many new shares were issued.

For example, if revenue rises from 100 to 120 (a 20% increase) but operating income stays at 10, the company grew sales without growing operating profit. The reason matters: it could be investment for the future or a business under cost pressure.

Because of seasonality, compare a quarter with the same quarter a year earlier rather than with the previous quarter.

Figures here are hypothetical and companies named elsewhere are only illustrations.

## Common mistake

Focusing only on revenue growth or only on net income. Fast sales growth with no path to profit carries different risks than slow growth with high profitability. Another error is treating accounting profit as cash: net income includes non-cash items, which is why you also study the cash flow statement.`,
    liveExample: {
      id: "income-statement",
      ticker: "MSFT",
      caption: "See revenue, operating income and net income by year for an example company.",
    },
    glossaryIds: ["eps", "revenue-growth", "net-margin"],
    quiz: [
      {
        id: "income-statement-q1",
        prompt: "Which line is called the bottom line?",
        options: ["Revenue", "Gross profit", "Net income", "Operating expenses"],
        correctIndex: 2,
        explanation: "Net income is at the bottom of the statement, after all costs, interest and taxes.",
      },
      {
        id: "income-statement-q2",
        prompt: "Revenue rises 20% but operating income is flat. What is a reasonable reading?",
        options: [
          "Costs grew about as fast as sales, so you should find out why",
          "The company is certainly failing",
          "The company is certainly improving",
          "The data must be wrong",
        ],
        correctIndex: 0,
        explanation:
          "Flat operating profit with higher sales means costs absorbed the growth. It may be investment or pressure, and only further analysis can tell.",
      },
      {
        id: "income-statement-q3",
        prompt: "Why compare a quarter with the same quarter of the previous year?",
        options: [
          "Because quarters are always identical",
          "To avoid distortion from seasonality",
          "Because the law requires it",
          "To hide one-off items",
        ],
        correctIndex: 1,
        explanation:
          "Many businesses are seasonal, so comparing like with like removes the calendar effect from the growth figure.",
      },
    ],
  },
  {
    id: "margins",
    trackId: "fundamental-analysis",
    order: 2,
    title: "Margins: how much is kept from each sale",
    summary: "Gross, operating and net margin show profitability at different levels.",
    minutes: 4,
    body: `## What it is

A margin is a profit measure divided by revenue, expressed as a percentage. It tells you how many cents of profit the company keeps from each unit of sales. The three most common are:

- Gross margin: (revenue minus cost of goods sold) / revenue.
- Operating margin: operating income / revenue. It includes operating costs but excludes interest and taxes.
- Net margin: net income / revenue.

If a company sells 200 and has a net income of 20, its net margin is 10%.

## How to read it

Margins are most useful when compared with something:

- Over time: a margin that steadily expands may reflect pricing power or efficiency, while a shrinking one may signal rising costs or competition.
- Against peers in the same industry: typical margins differ enormously between sectors. Software businesses often have high gross margins, while supermarkets work with thin ones and compensate with volume.
- Across levels: a large gap between gross and operating margin means heavy operating expenses, such as research or marketing.

Low margins are not automatically bad and high margins are not automatically good. A low-margin business can be excellent if it turns over assets quickly. A high margin can attract competitors that erode it.

Pair margins with growth. A company growing sales while keeping or improving margins is scaling profitably. A company growing sales by cutting prices may show shrinking margins.

Look also at how the figure is built: one-off gains can inflate net margin in a single period, so operating margin is often a steadier guide to the core business.

The live example shows margins for an example ticker, as an illustration and not a recommendation.

## Common mistake

Comparing margins across very different industries as if they were equivalent. A 5% net margin may be normal in one sector and weak in another. Another common mistake is looking at one year only; a single period can be distorted by unusual items.`,
    liveExample: {
      id: "margins",
      ticker: "MSFT",
      caption: "See gross, operating and net margins over several years for an example company.",
    },
    glossaryIds: ["gross-margin", "operating-margin", "net-margin"],
    quiz: [
      {
        id: "margins-q1",
        prompt: "A company has revenue of 500 and net income of 50. What is its net margin?",
        options: ["5%", "10%", "50%", "100%"],
        correctIndex: 1,
        explanation: "Net margin is net income divided by revenue: 50 / 500 = 10%.",
      },
      {
        id: "margins-q2",
        prompt: "What is the best way to judge whether a margin is high or low?",
        options: [
          "Compare it with the company's own history and with similar companies",
          "Compare it with companies in any industry",
          "Compare it with the share price",
          "Any margin above 1% is good",
        ],
        correctIndex: 0,
        explanation:
          "Margins vary a lot by industry, so context from history and peers is what gives the number meaning.",
      },
      {
        id: "margins-q3",
        prompt: "Why can operating margin be steadier than net margin for judging the core business?",
        options: [
          "It includes one-off gains",
          "It excludes interest, taxes and often some unusual items",
          "It ignores costs",
          "It is always higher",
        ],
        correctIndex: 1,
        explanation:
          "Operating margin focuses on the operations themselves, leaving out financing and tax effects that can distort net margin.",
      },
    ],
  },
  {
    id: "free-cash-flow-lesson",
    trackId: "fundamental-analysis",
    order: 3,
    title: "Free cash flow",
    summary: "The cash left after running and maintaining the business.",
    minutes: 5,
    body: `## What it is

Free cash flow (FCF) is the cash a company generates from its operations after subtracting the money it spends on capital expenditures, such as equipment, buildings and technology. In short: operating cash flow minus capital expenditures.

It matters because cash is what a company can use to pay dividends, buy back shares, reduce debt or invest in growth. Net income is an accounting measure that includes non-cash items and timing differences, while FCF follows the money.

## How to read it

Compare FCF with net income. If a company reports consistent profits but FCF is regularly much lower or negative, ask why. Reasons can be benign, such as heavy investment for growth, or concerning, such as sales that are recorded but not collected.

Useful related measures:

- FCF margin: FCF divided by revenue.
- FCF yield: FCF divided by market cap, showing how much cash the business generates relative to its price.
- Trend: several years of data say more than one, because capital spending is often uneven.

A negative FCF is not automatically bad. A young company investing heavily can have negative FCF while building something valuable, but it then needs funding from cash reserves, debt or issuing shares, which carries its own risks.

For example, a company with operating cash flow of 150 and capital spending of 100 has FCF of 50. If its market cap is 1,000, its FCF yield is 5%.

Also consider what is behind the number. A temporary boost, such as delaying maintenance spending or stretching payments to suppliers, can lift FCF for a period without being sustainable.

The example ticker is an illustration only and not a recommendation.

## Common mistake

Treating a single high FCF year as the norm. Capital spending cycles can make one year look unusually strong or weak. Another error is ignoring stock-based compensation or share dilution, which can make the cash picture look better than the benefit to existing shareholders.`,
    liveExample: {
      id: "free-cash-flow",
      ticker: "AAPL",
      caption: "Compare free cash flow with net income, year by year, for an example company.",
    },
    glossaryIds: ["free-cash-flow", "fcf-yield", "share-dilution"],
    quiz: [
      {
        id: "free-cash-flow-lesson-q1",
        prompt: "How is free cash flow usually calculated?",
        options: [
          "Revenue minus net income",
          "Operating cash flow minus capital expenditures",
          "Net income plus dividends",
          "Total assets minus debt",
        ],
        correctIndex: 1,
        explanation:
          "FCF is what remains of operating cash after the investments needed to keep and grow the business.",
      },
      {
        id: "free-cash-flow-lesson-q2",
        prompt: "A company reports profits every year, but its FCF is repeatedly negative. What is a sensible response?",
        options: [
          "Ignore it, profit is what counts",
          "Investigate why, for example heavy investment or uncollected sales",
          "Assume it is fraud",
          "Assume FCF is wrong",
        ],
        correctIndex: 1,
        explanation:
          "A persistent gap between profit and cash has a reason that matters, and the explanation can be harmless or a warning.",
      },
      {
        id: "free-cash-flow-lesson-q3",
        prompt: "FCF of 50 and a market cap of 1,000. What is the FCF yield?",
        options: ["0.5%", "5%", "50%", "20%"],
        correctIndex: 1,
        explanation: "FCF yield is FCF divided by market cap: 50 / 1,000 = 5%.",
      },
    ],
  },
  {
    id: "balance-sheet-net-debt",
    trackId: "fundamental-analysis",
    order: 4,
    title: "Balance sheet and net debt",
    summary: "What a company owns, what it owes and how much debt it can carry.",
    minutes: 5,
    body: `## What it is

The balance sheet is a snapshot, on one date, of what a company owns (assets), what it owes (liabilities) and the remainder that belongs to shareholders (equity). It follows the identity: assets = liabilities + equity.

Debt is a central part of it. Borrowing can finance growth, but it must be repaid with interest regardless of how the business is doing. This makes leverage a key source of risk.

## How to read it

A few measures help you judge the debt situation:

- Net debt: total debt minus cash and equivalents. A company with 300 of debt and 100 of cash has a net debt of 200. If cash exceeds debt, net debt is negative (a net cash position).
- Net debt / EBITDA: how many years of operating earnings would be needed to repay net debt. Higher numbers imply more strain, and acceptable levels differ by industry.
- Interest coverage: operating income divided by interest expense. A low figure means little cushion to pay interest if earnings fall.
- Current ratio: current assets divided by current liabilities, a view of short-term liquidity.
- Debt to equity: how much the company relies on borrowing compared with shareholders' funds.

Also examine when the debt matures. A company with large repayments due soon and tight cash may need to refinance in unfavorable conditions, while one with long-dated debt has more time.

Context is essential. Stable, predictable businesses can sustain more debt than those with volatile revenue. Some industries, such as utilities or banks, normally work with high leverage.

Use the live example to check the net debt of an example company, only as an illustration and not a recommendation.

## Common mistake

Looking only at total debt without considering cash, earnings or maturity. A large debt may be manageable for a company with strong, stable cash flow, and a small debt may be dangerous for one with none. Also, comparing leverage ratios across very different sectors can mislead.`,
    liveExample: {
      id: "net-debt",
      ticker: "KO",
      caption: "See debt, cash, net debt and net debt relative to EBITDA for an example company.",
    },
    glossaryIds: ["net-debt", "net-debt-ebitda", "interest-coverage", "debt-to-equity", "current-ratio"],
    quiz: [
      {
        id: "balance-sheet-net-debt-q1",
        prompt: "A company has debt of 300 and cash of 120. What is its net debt?",
        options: ["420", "180", "300", "120"],
        correctIndex: 1,
        explanation: "Net debt is debt minus cash: 300 - 120 = 180.",
      },
      {
        id: "balance-sheet-net-debt-q2",
        prompt: "What does a low interest coverage ratio suggest?",
        options: [
          "Earnings provide little cushion to pay interest",
          "The company has no debt",
          "The company is very profitable",
          "Shares are cheap",
        ],
        correctIndex: 0,
        explanation:
          "Interest coverage compares operating income with interest. A low value means a modest drop in earnings could make payments hard.",
      },
      {
        id: "balance-sheet-net-debt-q3",
        prompt: "Why is total debt alone a weak indicator of financial risk?",
        options: [
          "Debt never matters",
          "It ignores cash, earnings power and maturity dates",
          "It is always reported wrongly",
          "Debt is always bad",
        ],
        correctIndex: 1,
        explanation:
          "The same debt is more or less risky depending on cash on hand, how much the business earns and when repayments fall due.",
      },
    ],
  },
  {
    id: "valuation-multiples",
    trackId: "fundamental-analysis",
    order: 5,
    title: "Valuation multiples: P/E and EV/EBITDA",
    summary: "Ratios that compare what the market pays with what a business earns.",
    minutes: 6,
    body: `## What it is

A valuation multiple divides the price of a company by a measure of what it produces. It lets you compare companies of different sizes on a common scale.

- P/E ratio (price to earnings): share price divided by earnings per share. If a share trades at 30 and earns 2 per share, the P/E is 15, meaning the market pays 15 for each unit of yearly earnings.
- EV/EBITDA: enterprise value divided by EBITDA (earnings before interest, taxes, depreciation and amortization). Enterprise value adds net debt to market cap, so it considers the whole business including financing.

## How to read it

A multiple is a relative number, so it needs a reference:

- The company's own history.
- Similar companies in the same industry.
- Expected growth: a higher multiple often reflects expectations of faster growth or higher quality, while a low one may reflect expected decline or higher risk.

EV/EBITDA is useful when comparing companies with different debt levels, because P/E is influenced by leverage. P/E is simple but breaks down when earnings are negative or temporarily depressed. Check whether earnings are trailing (past twelve months) or forward (analyst estimates), since estimates can be wrong.

Other multiples, like price to sales or price to book, fit cases where earnings are unreliable. PEG ratio adjusts P/E for growth.

A low multiple does not mean a bargain and a high multiple does not mean an overpriced company. A low P/E can be a "value trap" if earnings are about to fall, and a high P/E can be reasonable if earnings grow fast. Multiples summarize market expectations, they do not predict outcomes.

The live example shows an example ticker's current multiple and the earnings per share it implies, as an illustration only.

## Common mistake

Comparing P/E ratios across industries or business models without adjusting. Banks, software firms and utilities have different structures, growth and risk, so their typical multiples differ. Another mistake is using one multiple alone instead of looking at several together with the quality of earnings.`,
    liveExample: {
      id: "pe-ratio",
      ticker: "AAPL",
      caption: "See the current P/E of an example company and the earnings per share it implies. Try other tickers to compare multiples.",
    },
    glossaryIds: ["pe-ratio", "ev-ebitda", "enterprise-value", "peg-ratio", "price-to-sales"],
    quiz: [
      {
        id: "valuation-multiples-q1",
        prompt: "A share costs 45 and earns 3 per share. What is the P/E?",
        options: ["3", "15", "45", "135"],
        correctIndex: 1,
        explanation: "P/E is price divided by earnings per share: 45 / 3 = 15.",
      },
      {
        id: "valuation-multiples-q2",
        prompt: "Why is EV/EBITDA useful to compare companies with different debt levels?",
        options: [
          "Because enterprise value includes net debt",
          "Because it ignores profit",
          "Because it uses only the share price",
          "Because it is always lower than P/E",
        ],
        correctIndex: 0,
        explanation:
          "Enterprise value adds net debt to market cap, so the measure covers the whole business regardless of how it is financed.",
      },
      {
        id: "valuation-multiples-q3",
        prompt: "A stock has a low P/E compared with its peers. What can you conclude?",
        options: [
          "It is definitely undervalued",
          "It will rise",
          "Nothing definite: the market may expect lower growth or higher risk",
          "Its earnings are guaranteed",
        ],
        correctIndex: 2,
        explanation:
          "A multiple reflects expectations. A low value can signal a bargain or a justified discount, and more analysis is needed to tell.",
      },
    ],
  },
  {
    id: "growth-vs-value",
    trackId: "fundamental-analysis",
    order: 6,
    title: "Growth vs value",
    summary: "Two broad styles of looking at companies, with different trade-offs.",
    minutes: 4,
    body: `## What it is

Growth and value are two labels used to describe styles of companies or of investing.

- Growth companies are those expected to increase sales and earnings faster than average. They often reinvest most of their profits, pay little or no dividend and trade at higher multiples.
- Value companies trade at lower multiples relative to earnings, assets or cash flow. They are often more mature, may pay dividends and have slower expected growth.

The labels are simplifications. Many companies do not fit neatly into one, and a company can move from one category to another over time.

## How to read it

Common metrics used to describe each style:

- Growth: revenue growth, earnings growth, PEG ratio, reinvestment rate.
- Value: P/E, price to book, price to sales, FCF yield, dividend yield.

Each style has characteristic risks. Growth stocks depend on expectations that must be met: if growth disappoints, the price can fall sharply because a lot of future success is already included in it. Value stocks can stay cheap for long periods, and a low multiple sometimes reflects real problems, the so-called value trap.

Over history, leadership has rotated between the two styles, depending on interest rates, economic conditions and market mood. No style wins in every period, and that pattern in the past does not predict which will do better next.

A practical approach is to understand what a price implies. A high multiple requires strong growth to be justified. A low multiple requires that the business does not deteriorate. Asking what has to be true for the price to make sense is more informative than the label.

Neither style is better in itself, and this lesson does not suggest one over the other. Examples used elsewhere are illustrations.

## Common mistake

Equating growth with quality and value with bargain. Rapid growth can be unprofitable or require constant funding, and low multiples can reflect weak businesses. Another mistake is switching style after a short period of better results, which is often chasing recent performance.`,
    liveExample: {
      id: "value-growth-compare",
      ticker: "NVDA",
      caption: "Compare valuation multiples and growth for two example tickers. Pick any second ticker to explore.",
    },
    glossaryIds: ["peg-ratio", "revenue-growth", "price-to-book"],
    quiz: [
      {
        id: "growth-vs-value-q1",
        prompt: "Which description fits a typical growth company?",
        options: [
          "Low multiples and high dividends",
          "Fast expected growth, reinvestment and often higher multiples",
          "No sales",
          "Fixed returns",
        ],
        correctIndex: 1,
        explanation:
          "Growth companies are valued for expected expansion, so they tend to reinvest earnings and trade at higher multiples.",
      },
      {
        id: "growth-vs-value-q2",
        prompt: "What is a value trap?",
        options: [
          "A stock that looks cheap but whose business is deteriorating",
          "A stock with a guaranteed rebound",
          "A very expensive stock",
          "A tax on dividends",
        ],
        correctIndex: 0,
        explanation:
          "A low multiple may reflect falling earnings. If the business keeps weakening, the stock can remain cheap or get cheaper.",
      },
      {
        id: "growth-vs-value-q3",
        prompt: "What does history show about growth and value styles?",
        options: [
          "Growth always wins",
          "Value always wins",
          "Leadership rotates and no style wins in every period",
          "They always move together",
        ],
        correctIndex: 2,
        explanation:
          "Each style has had strong and weak periods. Past rotation does not predict which will lead in the future.",
      },
    ],
  },
  {
    id: "cash-runway-dilution",
    trackId: "fundamental-analysis",
    order: 7,
    title: "Cash runway and dilution in small caps",
    summary: "How companies that burn cash fund themselves, and what it means for shareholders.",
    minutes: 5,
    body: `## What it is

Many small and early-stage companies spend more cash than they generate. For them, an important question is how long the money will last. That time is the cash runway: cash on hand divided by the monthly cash burn. With 12 million in cash and a burn of 1 million per month, the runway is 12 months.

When cash runs low, a company needs funds. It can borrow, sell assets, or issue new shares. Issuing shares brings in cash but increases the share count, which is called dilution: each existing shareholder owns a smaller percentage of the company.

## How to read it

Questions to ask about a cash-burning company:

- What is the runway at the current burn, and is the burn rising?
- How has the share count changed over recent years? A steady rise indicates repeated dilution.
- How is it raising money? Instruments such as at-the-market (ATM) offerings let a company sell shares gradually into the market, and convertible notes can turn into shares later, both of which affect future dilution.
- Does it have a plan for reaching positive cash flow?

Dilution is not automatically bad. If new funds are used to build something that increases the company's value more than the dilution costs, existing shareholders can still benefit. The problem arises when shares are issued repeatedly without enough progress to justify it.

A short runway also creates pressure: the company may have to raise money at unattractive prices. Small caps often have fewer financing options, so the effect can be stronger.

Look at per-share figures, not just totals, because total revenue can grow while revenue per share does not.

Example tickers are illustrations only, and this is not a view on any company.

## Common mistake

Looking at the market cap or the cash balance alone. A company can have a large cash pile and a short runway if burn is high. Another error is ignoring potential dilution from convertibles, warrants and stock compensation, which do not appear in the current share count.`,
    liveExample: {
      id: "cash-runway",
      ticker: "CLSK",
      caption: "See the cash runway estimated from cash and burn for an example small-cap company, as an illustration only.",
    },
    glossaryIds: ["cash-runway", "share-dilution", "atm-offering", "convertible-note", "free-cash-flow"],
    quiz: [
      {
        id: "cash-runway-dilution-q1",
        prompt: "A company has 18 million in cash and burns 1.5 million per month. What is its runway?",
        options: ["6 months", "12 months", "18 months", "27 months"],
        correctIndex: 1,
        explanation: "Runway is cash divided by monthly burn: 18 / 1.5 = 12 months.",
      },
      {
        id: "cash-runway-dilution-q2",
        prompt: "What is dilution?",
        options: [
          "A fall in the company's debt",
          "A reduction of each shareholder's ownership percentage when new shares are issued",
          "A rise in dividends",
          "A tax on shares",
        ],
        correctIndex: 1,
        explanation:
          "More shares outstanding means each existing share represents a smaller slice of the company.",
      },
      {
        id: "cash-runway-dilution-q3",
        prompt: "Which statement about dilution is most accurate?",
        options: [
          "It is always harmful",
          "It is never relevant",
          "It can be acceptable if the funds create more value than the ownership given up",
          "It only affects large companies",
        ],
        correctIndex: 2,
        explanation:
          "What matters is the use of the money. Value created per share, not the share count alone, decides whether dilution was worthwhile.",
      },
    ],
  },
  {
    id: "quality-scores",
    trackId: "fundamental-analysis",
    order: 8,
    title: "Quality scores: Altman Z and Piotroski F",
    summary: "Two checklists that summarize financial health in a single number.",
    minutes: 5,
    body: `## What it is

Quality scores condense several financial ratios into one number, so you can screen many companies quickly. Two well known examples are:

- Altman Z-score: built to estimate the risk of financial distress. It combines ratios of working capital, retained earnings, operating profit, market value of equity versus liabilities and sales, all relative to assets. Lower scores are associated with higher distress risk, and common interpretations place scores below about 1.8 in a "distress zone" and above about 3 in a "safe zone", with a grey area between.
- Piotroski F-score: a checklist of nine yes/no tests on profitability, leverage and liquidity, and operating efficiency. Each passed test adds one point, giving a score from 0 to 9. Higher scores indicate improving financial health.

## How to read it

Treat a score as a prompt for questions, not an answer:

- A low Altman Z invites a look at debt, cash flow and earnings. Find which component drives it.
- A Piotroski score is easiest to interpret as a change over time. Which tests failed this year that passed last year?
- Compare within the same industry. The Altman formula was designed for manufacturing companies, and results for banks, insurers or asset-light businesses can be misleading.

Scores use historical accounting data, so they are backward looking. They may not capture new events such as a recent financing, a lawsuit or a change in the market. Accounting figures can also be affected by one-off items.

Combine them with the underlying statements. If a score looks weak, check whether the weakness is temporary, structural or an artifact of the formula.

## Common mistake

Treating the thresholds as precise predictions. A company in the "safe zone" can still run into trouble, and one in the "distress zone" can recover. Scores indicate patterns found in past data, not certainty about the future. Another mistake is applying a model to a type of company it was not designed for.`,
    liveExample: {
      id: "quality-scores",
      ticker: "AAPL",
      caption: "See the Altman Z-score and Piotroski F-score computed from the financial statements of an example company.",
    },
    glossaryIds: ["altman-z-score", "piotroski-f-score", "current-ratio", "roa"],
    quiz: [
      {
        id: "quality-scores-q1",
        prompt: "What is the Altman Z-score designed to indicate?",
        options: [
          "How fast the share price will rise",
          "The risk of financial distress",
          "The size of the dividend",
          "The best time to trade",
        ],
        correctIndex: 1,
        explanation: "It combines financial ratios into a measure associated with distress risk.",
      },
      {
        id: "quality-scores-q2",
        prompt: "How does the Piotroski F-score work?",
        options: [
          "It forecasts next year's price",
          "It adds a point for each of nine tests passed on profitability, leverage and efficiency",
          "It is based on chart patterns",
          "It measures market volatility",
        ],
        correctIndex: 1,
        explanation: "It is a nine-item checklist, with higher totals meaning more tests were met.",
      },
      {
        id: "quality-scores-q3",
        prompt: "Why should a quality score not be used as a prediction by itself?",
        options: [
          "It uses historical data and may not apply to every type of company",
          "It is always random",
          "It only works on weekends",
          "It is illegal to use",
        ],
        correctIndex: 0,
        explanation:
          "Scores summarize past accounting data and were built with certain companies in mind, so they are a starting point for analysis, not a forecast.",
      },
    ],
  },
];
