import type { Lesson } from "./types";

export const MACRO_MARKET_LESSONS: Lesson[] = [
  {
    id: "interest-rates",
    trackId: "macro-market",
    order: 1,
    title: "Interest rates",
    summary: "The price of borrowing money and why it affects every asset.",
    minutes: 5,
    body: `## What it is

An interest rate is the cost of borrowing money, or the reward for lending it. Central banks set a short-term policy rate that influences what banks charge each other, and through that the cost of loans, mortgages and savings across the economy. Longer-term rates, such as the yield on a 10-year government bond, are set by the market and reflect expectations about growth, inflation and policy.

## How to read it

Interest rates matter for investments through several channels:

- Discounting: the value of a company today depends on future cash flows discounted at a rate. When rates rise, future cash flows are worth less in present terms, which tends to weigh most on companies whose profits are expected far in the future.
- Borrowing costs: higher rates raise the cost of debt for companies and households, which can slow spending and investment. Companies with a lot of floating-rate or maturing debt are more exposed.
- Competition from safer assets: when government bonds or deposits pay more, the extra return required from riskier assets goes up.
- Bond prices: existing bond prices move in the opposite direction to rates. If rates rise, older bonds with lower coupons become less valuable.

The effects are tendencies, not rules. Markets often move on expectations before the central bank acts, so what matters is often the change relative to what was expected. Stock prices also react to why rates are changing: rising rates because the economy is strong can be viewed differently from rising rates to fight inflation.

For example, if a 10-year government bond yield moves from 2% to 4%, a safe asset now pays double, which changes how investors compare it with the earnings yield of stocks.

The live example shows the 10-year US Treasury yield with its recent history. It is shown for information and does not imply a view on markets.

## Common mistake

Assuming a simple, predictable link such as "rates up means stocks down". Historically the relationship has varied, depending on the starting level, the reason for the change and what was already priced in. Past relationships do not predict future ones.`,
    liveExample: {
      id: "treasury-10y",
      caption: "Follow the 10-year US Treasury yield and where it sits within its one-year range.",
    },
    glossaryIds: ["treasury-10y", "yield-curve", "pe-ratio"],
    quiz: [
      {
        id: "interest-rates-q1",
        prompt: "What usually happens to the price of existing bonds when interest rates rise?",
        options: ["It falls", "It rises", "It stays fixed", "It doubles"],
        correctIndex: 0,
        explanation: "New bonds pay higher coupons, so older bonds with lower coupons become less attractive and their price falls.",
      },
      {
        id: "interest-rates-q2",
        prompt: "Why do higher rates tend to weigh on companies whose profits are expected far in the future?",
        options: [
          "Distant cash flows are discounted more heavily",
          "They stop paying taxes",
          "Their shares are cancelled",
          "Because they have no debt",
        ],
        correctIndex: 0,
        explanation: "A higher discount rate reduces the present value of cash flows more the further away they are.",
      },
      {
        id: "interest-rates-q3",
        prompt: "Which statement is most accurate?",
        options: [
          "Rates up always means stocks down",
          "The effect depends on the starting level, the reason for the change and expectations",
          "Rates never matter",
          "Only central banks are affected",
        ],
        correctIndex: 1,
        explanation: "Market reactions have varied historically, so a fixed rule is not reliable.",
      },
    ],
  },
  {
    id: "inflation",
    trackId: "macro-market",
    order: 2,
    title: "Inflation",
    summary: "The general rise in prices and what it does to purchasing power and returns.",
    minutes: 5,
    body: `## What it is

Inflation is the general rise in the prices of goods and services over time, which reduces what a unit of money can buy. It is usually measured as the yearly percentage change in a consumer price index (CPI), a basket of typical purchases. If inflation is 3%, something that cost 100 a year ago costs about 103 today.

Many central banks aim for a low and stable inflation rate, around 2% in several major economies, and use interest rates to influence it.

## How to read it

For investors, the key idea is the difference between nominal and real returns:

- Nominal return: the percentage gain before adjusting for inflation.
- Real return: the gain after inflation. A 5% nominal return with 3% inflation is roughly a 2% real return.

Cash that earns less than inflation loses purchasing power, even though the number in the account does not fall. This is why long-term investors pay attention to real returns.

Inflation also interacts with companies in different ways:

- Firms that can raise prices without losing customers may keep their margins, while those with fixed prices and rising costs may see margins shrink.
- Inflation often leads central banks to raise interest rates, which affects valuations and borrowing costs.
- Different sectors have shown different sensitivities in different periods, and there is no fixed pattern that can be relied on.

Headline inflation includes all items, while core inflation excludes volatile items such as food and energy to show the underlying trend. Both are published with a delay and revised sometimes.

Expectations matter too. Markets respond to inflation data compared with what was forecast, so a high figure may have little effect if it was already expected.

This lesson is educational and does not suggest any position on inflation protection.

## Common mistake

Ignoring inflation when comparing returns, or assuming one specific asset is always an inflation hedge. Results vary by period and country, and past behavior does not predict future results. Another mistake is confusing a fall in the inflation rate (disinflation) with a fall in prices (deflation): prices are still rising, only more slowly.`,
    glossaryIds: ["annual-return", "cagr", "treasury-10y"],
    quiz: [
      {
        id: "inflation-q1",
        prompt: "An investment returns 5% nominal while inflation is 3%. What is the approximate real return?",
        options: ["8%", "2%", "5%", "15%"],
        correctIndex: 1,
        explanation: "Real return is roughly nominal return minus inflation: 5% - 3% = 2%.",
      },
      {
        id: "inflation-q2",
        prompt: "Inflation falls from 6% to 3%. What happened to prices?",
        options: [
          "They are falling",
          "They are still rising, but more slowly",
          "They returned to last year's level",
          "They are frozen",
        ],
        correctIndex: 1,
        explanation: "A lower inflation rate means slower price increases (disinflation). Falling prices would be deflation.",
      },
      {
        id: "inflation-q3",
        prompt: "Why does cash earning less than inflation lose value?",
        options: [
          "The balance decreases in number",
          "Its purchasing power shrinks even if the balance is unchanged",
          "Banks remove the money",
          "Taxes are cancelled",
        ],
        correctIndex: 1,
        explanation: "The same amount buys fewer goods when prices rise faster than the interest earned.",
      },
    ],
  },
  {
    id: "vix-lesson",
    trackId: "macro-market",
    order: 3,
    title: "The VIX",
    summary: "A gauge of the volatility the options market expects for the S&P 500.",
    minutes: 4,
    body: `## What it is

The VIX is an index published by the Cboe that estimates the volatility the options market expects for the S&P 500 over the next 30 days. It is calculated from the prices of S&P 500 index options and is quoted in percentage points on an annualized basis. A VIX of 20 implies an expected annualized volatility of about 20%, which translates into a typical daily move of around 1.3% (20 divided by the square root of 252 trading days).

It is often called the "fear index", though it is better described as a measure of expected turbulence and the price of protection.

## How to read it

Some reference points, which are loose conventions:

- Readings below about 15 suggest calm conditions.
- Readings around 20 are often considered typical to somewhat elevated.
- Readings above 30 have usually accompanied periods of stress.

Important characteristics:

- The VIX tends to rise when the S&P 500 falls sharply, because investors pay more for protection. The two usually move in opposite directions.
- It tends to revert: extreme highs have generally not lasted, and calm periods eventually end, though timing is unknown.
- It measures expectations of volatility, not direction. A high VIX does not say whether the market will go up or down.
- Its level should be seen against its own history, for example by its percentile in the last year.

The VIX is information about sentiment and risk pricing. It is not a reliable signal by itself of market tops or bottoms, and low readings have preceded sharp moves just as high readings have. Past patterns do not predict future results.

Use the live example to see the current VIX and where it sits relative to the past year. It is shown for education and not as a suggestion to act.

## Common mistake

Treating a high VIX as a buy signal or a low VIX as a sell signal. Neither is reliable on its own. Another mistake is reading the VIX as a forecast of what will happen: it reflects what investors are paying for protection now.`,
    liveExample: {
      id: "vix",
      caption: "See the current VIX and its percentile over the last year.",
    },
    glossaryIds: ["vix", "volatility", "beta"],
    quiz: [
      {
        id: "vix-lesson-q1",
        prompt: "What does the VIX measure?",
        options: [
          "The expected 30-day volatility of the S&P 500 implied by options",
          "The price of the S&P 500",
          "The number of shares traded",
          "Company earnings",
        ],
        correctIndex: 0,
        explanation: "It is derived from S&P 500 option prices and reflects expected volatility, not direction.",
      },
      {
        id: "vix-lesson-q2",
        prompt: "What does a high VIX tell you about the direction of the market?",
        options: [
          "That it will rise",
          "That it will fall",
          "Nothing about direction, only that larger swings are being priced in",
          "That the market is closed",
        ],
        correctIndex: 2,
        explanation: "Volatility is about the size of moves. It does not indicate whether they will be up or down.",
      },
      {
        id: "vix-lesson-q3",
        prompt: "How does the VIX usually behave when the S&P 500 falls sharply?",
        options: [
          "It tends to rise as demand for protection grows",
          "It tends to fall to zero",
          "It stays constant",
          "It copies the S&P 500",
        ],
        correctIndex: 0,
        explanation: "The two are generally inversely related because falling markets increase the price of options protection.",
      },
    ],
  },
  {
    id: "yield-curve-lesson",
    trackId: "macro-market",
    order: 4,
    title: "The yield curve",
    summary: "How bond yields differ across maturities, and what an inversion means.",
    minutes: 5,
    body: `## What it is

The yield curve plots the yields of government bonds against their maturity, from short (for example 3 months or 2 years) to long (10 or 30 years). Normally, longer maturities pay higher yields to compensate for locking money up longer, so the curve slopes upward.

A commonly watched summary is the spread between the 10-year and the 2-year yield. When the shorter yield is higher than the longer one, the curve is inverted.

## How to read it

Typical shapes:

- Normal (upward sloping): the market expects steady growth and inflation, or at least normal compensation for time.
- Flat: short and long yields are similar.
- Inverted: short-term yields above long-term ones. This often happens when central banks have raised short rates substantially and investors expect growth or rates to be lower in the future.

An inverted curve has preceded most US recessions in the past decades, which is why it receives attention. But the timeline is long and variable, from several months to well over a year, and there have been periods when the curve inverted and no recession followed shortly. The number of historical cases is also small. It is a piece of information on market expectations, not a forecast with a date.

The curve also affects banks, which typically borrow short and lend long, so a flat or inverted curve can squeeze their margins.

For example, if the 2-year yield is 4.5% and the 10-year is 4.0%, the 10y-2y spread is -0.5 percentage points, which is an inversion.

The live example shows the current spread and its history, for information only.

## Common mistake

Using an inversion as a timing signal for the stock market. Stocks have risen and fallen in many ways after inversions, and past episodes do not predict the next. Another mistake is mixing definitions: different spreads (10y-2y, 10y-3m) can differ in sign at the same time.`,
    liveExample: {
      id: "yield-curve",
      caption: "Compare short and long-term yields and see whether the curve is normal or inverted.",
    },
    glossaryIds: ["yield-curve", "treasury-10y"],
    quiz: [
      {
        id: "yield-curve-lesson-q1",
        prompt: "What is an inverted yield curve?",
        options: [
          "Short-term yields are higher than long-term yields",
          "Long-term yields are much higher than short-term yields",
          "All yields are zero",
          "Bonds stop trading",
        ],
        correctIndex: 0,
        explanation: "Inversion means the usual order is reversed, with shorter maturities yielding more than longer ones.",
      },
      {
        id: "yield-curve-lesson-q2",
        prompt: "The 2-year yield is 4.5% and the 10-year is 4.0%. What is the 10y-2y spread?",
        options: ["+0.5", "-0.5", "0", "+8.5"],
        correctIndex: 1,
        explanation: "10-year minus 2-year is 4.0 - 4.5 = -0.5 percentage points, so the curve is inverted.",
      },
      {
        id: "yield-curve-lesson-q3",
        prompt: "Why is an inversion not a precise timing tool?",
        options: [
          "The lag before any slowdown varies and the sample of cases is small",
          "It always predicts the exact date",
          "It has never preceded a recession",
          "It only exists in textbooks",
        ],
        correctIndex: 0,
        explanation: "Historical cases are few and the delay is long and variable, so it is not a reliable predictor on its own.",
      },
    ],
  },
  {
    id: "us-dollar",
    trackId: "macro-market",
    order: 5,
    title: "The US dollar",
    summary: "Why the dollar's strength matters for global markets and for returns in other currencies.",
    minutes: 4,
    body: `## What it is

The US dollar is the world's main reserve and trading currency. Many commodities, loans and international transactions are priced in dollars. The US Dollar Index (DXY) measures its value against a basket of major currencies, with the euro having the largest weight.

When the index rises, the dollar is strengthening against that basket, and when it falls, it is weakening.

## How to read it

The dollar influences markets in several ways:

- Multinational companies: US firms with large foreign sales may see those revenues shrink when converted to a stronger dollar, and the reverse when it weakens.
- Commodities: since many are priced in dollars, a stronger dollar makes them more expensive for buyers using other currencies, which can weigh on demand.
- Emerging markets: borrowers with debts in dollars face a heavier burden when it rises.
- Your own returns: if you hold assets in a currency different from your own, exchange rate moves add to or subtract from the result. A European investor holding a US stock earns the stock's return plus the change in the dollar versus the euro.

Currency moves are driven by interest rate differences, growth, trade flows and risk sentiment, and they are very hard to forecast. Even professionals have limited success at predicting exchange rates.

For example, if a US stock gains 5% in dollars but the dollar loses 4% against your currency, your return in your currency is only about 1%.

The live example shows the dollar index with its position within the last year, for information only.

## Common mistake

Ignoring currency effects when assessing the returns of foreign assets. Another mistake is assuming a fixed relationship such as "a strong dollar is bad for stocks". The link has varied across periods, and past relationships do not predict future ones.`,
    liveExample: {
      id: "dollar-index",
      caption: "See the US Dollar Index and where it stands within its one-year range.",
    },
    glossaryIds: ["us-dollar-index", "total-return", "treasury-10y"],
    quiz: [
      {
        id: "us-dollar-q1",
        prompt: "What does a rising US Dollar Index indicate?",
        options: [
          "The dollar is strengthening against a basket of currencies",
          "The dollar is weakening",
          "US stocks are rising",
          "Interest rates are zero",
        ],
        correctIndex: 0,
        explanation: "The index tracks the dollar relative to a basket, so a rise means it gained value against those currencies.",
      },
      {
        id: "us-dollar-q2",
        prompt: "A US stock gains 5% in dollars while the dollar loses 4% against your currency. What is roughly your return?",
        options: ["About 9%", "About 1%", "About 5%", "About -4%"],
        correctIndex: 1,
        explanation: "The asset's gain and the currency move combine, so 5% minus 4% leaves roughly 1% in your currency.",
      },
      {
        id: "us-dollar-q3",
        prompt: "Why can a stronger dollar affect commodities priced in dollars?",
        options: [
          "They become more expensive for buyers using other currencies",
          "They are banned",
          "They become free",
          "Their quantity doubles",
        ],
        correctIndex: 0,
        explanation: "Buyers need more of their own currency to pay the same dollar price, which can reduce demand.",
      },
    ],
  },
  {
    id: "market-breadth-lesson",
    trackId: "macro-market",
    order: 6,
    title: "Market breadth",
    summary: "How many stocks participate in a market move.",
    minutes: 4,
    body: `## What it is

Market breadth measures how widely a market move is shared across stocks. An index can rise because most of its components are rising, or because a handful of very large companies are pulling it up while many others fall. Breadth indicators tell these situations apart.

Common measures include:

- The percentage of stocks in an index above their 50-day or 200-day moving average.
- The advance-decline line: the cumulative count of rising stocks minus falling stocks.
- The number of stocks hitting new highs compared with new lows.

## How to read it

Healthy breadth, in the usual description, means many stocks participate in a rise. Narrow breadth means few do.

For example, if an index of 500 stocks is at a record high but only 40% of its members trade above their 200-day average, the rally is concentrated in a minority. Because many indices are weighted by market cap, a few large companies can lift the whole index.

Some analysts see narrow breadth as a sign of fragility, since the market depends on a small group. Others note that narrow leadership has lasted for long periods without a decline. Breadth can stay narrow for months or years, so it is not a timing tool.

Breadth also shows the opposite situation: after a sell-off, if many stocks are already recovering, the move is described as broad.

Breadth should be read with context: the size of the index components, the sector mix and the time frame. A single reading says less than the trend of the measure.

Breadth is a description of participation, not a reliable signal by itself. Past patterns do not predict future results.

The live example shows the share of S&P 500 stocks above their 200-day average where available, as a piece of information and not a call to act.

## Common mistake

Equating an index's level with the health of the "average" stock. The headline index and the typical stock can behave differently. Another mistake is using weak breadth as a prediction that a fall is imminent, when it has often persisted without one.`,
    liveExample: {
      id: "market-breadth",
      caption: "See how many S&P 500 stocks trade above their 200-day average.",
    },
    glossaryIds: ["market-breadth", "sma", "benchmark"],
    quiz: [
      {
        id: "market-breadth-lesson-q1",
        prompt: "What does narrow market breadth mean?",
        options: [
          "Only a small group of stocks is driving the move",
          "All stocks are rising equally",
          "The market is closed",
          "Volume is zero",
        ],
        correctIndex: 0,
        explanation: "Narrow breadth means few stocks participate, so the index can rise while most components do not.",
      },
      {
        id: "market-breadth-lesson-q2",
        prompt: "An index is at a record high, but only 40% of its stocks are above their 200-day average. What can you say?",
        options: [
          "The rise is concentrated in a minority of stocks",
          "The index must fall tomorrow",
          "Breadth is perfect",
          "The data is invalid",
        ],
        correctIndex: 0,
        explanation: "The headline level and participation are different things. This shows concentration, not a certain outcome.",
      },
      {
        id: "market-breadth-lesson-q3",
        prompt: "Why is breadth not a timing tool?",
        options: [
          "Narrow breadth has persisted for long periods without a decline",
          "It is updated once a decade",
          "It always predicts crashes",
          "It does not use prices",
        ],
        correctIndex: 0,
        explanation: "History shows narrow breadth can last a long time, so it does not say when, or whether, anything will change.",
      },
    ],
  },
];
