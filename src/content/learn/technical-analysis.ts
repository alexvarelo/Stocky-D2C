import type { Lesson } from "./types";

export const TECHNICAL_ANALYSIS_LESSONS: Lesson[] = [
  {
    id: "trends",
    trackId: "technical-analysis",
    order: 1,
    title: "Trends",
    summary: "Price direction over time, and why defining it is partly subjective.",
    minutes: 4,
    body: `## What it is

In technical analysis, a trend is the general direction of a price over a period. An uptrend is often described as a sequence of higher highs and higher lows. A downtrend is a sequence of lower highs and lower lows. When neither pattern holds and the price moves within a range, it is called sideways or range-bound.

Technical analysis studies price and volume history to understand behavior. It does not predict the future, and trends are descriptions of what already happened.

## How to read it

Trends are always relative to a time frame. A stock can be in a long-term uptrend, a medium-term pullback and a short-term bounce at the same time. State the time frame first, then the direction.

Ways people describe a trend:

- Reading swing highs and lows on the chart.
- Drawing a trendline connecting successive lows (uptrend) or highs (downtrend).
- Checking where the price sits relative to a moving average.

None of these is exact. Two analysts can draw different lines on the same chart, which shows how subjective the process is. A trend is also only recognized with some delay: it is confirmed after enough data has formed, and by then part of the move may be over.

Trends end, sometimes gradually and sometimes suddenly. A trend that persisted does not imply it will continue, and past performance does not predict future results. Indicators and patterns are not reliable signals by themselves; they are one input among many and should be combined with an understanding of the company and your own risk tolerance.

The example ticker is an illustration, not a recommendation.

## Common mistake

Seeing trends everywhere. Random price series naturally produce streaks that look like trends in hindsight. Another mistake is ignoring the time frame, such as calling a stock "in an uptrend" based on a week of data while the longer picture points the other way.`,
    liveExample: {
      id: "moving-averages",
      ticker: "AAPL",
      caption: "See how price sits relative to its 50 and 200-day moving averages over the last year.",
    },
    glossaryIds: ["sma", "support-resistance", "volume"],
    quiz: [
      {
        id: "trends-q1",
        prompt: "How is an uptrend commonly described?",
        options: [
          "Higher highs and higher lows",
          "Lower highs and lower lows",
          "Prices that never move",
          "High trading volume only",
        ],
        correctIndex: 0,
        explanation: "A rising sequence of peaks and troughs is the usual definition of an uptrend.",
      },
      {
        id: "trends-q2",
        prompt: "Why must you state the time frame when describing a trend?",
        options: [
          "Because trends only exist on daily charts",
          "Because the same asset can show different trends on different time frames",
          "Because time frames do not matter",
          "Because trends are fixed by law",
        ],
        correctIndex: 1,
        explanation:
          "A long-term uptrend can contain short-term declines, so direction only has meaning relative to a time frame.",
      },
      {
        id: "trends-q3",
        prompt: "What is true about trends in technical analysis?",
        options: [
          "A trend guarantees its own continuation",
          "They describe the past and are recognized with some delay, so they are not reliable signals by themselves",
          "They can be drawn in only one way",
          "They predict earnings",
        ],
        correctIndex: 1,
        explanation:
          "Trends are descriptive and subjective. A past trend does not guarantee that it will continue.",
      },
    ],
  },
  {
    id: "sma-ema",
    trackId: "technical-analysis",
    order: 2,
    title: "Moving averages: SMA and EMA",
    summary: "Smoothing price to see its general direction.",
    minutes: 5,
    body: `## What it is

A moving average smooths price data by averaging recent prices into a single line that updates each period. It reduces noise so the general direction is easier to see.

- SMA (simple moving average): the plain average of the last N closing prices. A 50-day SMA averages the last 50 closes, each with equal weight.
- EMA (exponential moving average): also averages recent prices but gives more weight to the latest ones, so it reacts faster to changes.

Common lengths are 20, 50 and 200 periods, but there is nothing special about those numbers other than that many people watch them.

## How to read it

Typical observations:

- Price above a rising moving average is often described as a positive trend, and below a falling one as a negative trend.
- The slope of the line shows the trend's direction and strength.
- The distance between price and the average shows how stretched the price is from its recent norm.
- Shorter averages react quickly but give more false alerts, while longer ones are steadier but slower.

Moving averages are lagging indicators because they are calculated from past prices. They can only confirm what already happened. In sideways markets, price crosses back and forth across the average repeatedly, producing many misleading signs.

For example, if the last five closes are 10, 11, 12, 13 and 14, the 5-period SMA is 12, while the current price is 14. The average trails behind the price in a rising series.

A moving average is not a reliable signal by itself. It is a way to describe recent behavior, and it should be combined with other information such as the company's fundamentals and your risk tolerance. Past performance does not predict future results.

The live example shows the 50 and 200-day averages for an example ticker, which is an illustration only.

## Common mistake

Believing the 50 or 200-day lines act as magic barriers. Price often passes through them, and their influence, to the extent there is any, is partly because many participants watch them. Another mistake is choosing the length that best fits past data, which tends to fail on new data.`,
    liveExample: {
      id: "sma-ema",
      ticker: "AAPL",
      caption: "Compare the 50 and 200-day simple averages with the faster 12 and 26-day exponential averages on an example chart.",
    },
    glossaryIds: ["sma", "ema", "ma-crossover"],
    quiz: [
      {
        id: "sma-ema-q1",
        prompt: "What is the difference between an SMA and an EMA?",
        options: [
          "EMA gives more weight to recent prices",
          "SMA is only for long periods",
          "EMA ignores recent prices",
          "There is no difference",
        ],
        correctIndex: 0,
        explanation: "Both smooth price, but the EMA weights recent data more heavily so it responds faster.",
      },
      {
        id: "sma-ema-q2",
        prompt: "Why are moving averages called lagging indicators?",
        options: [
          "They are calculated from past prices, so they follow price",
          "They predict the next price exactly",
          "They are updated once a year",
          "They use future prices",
        ],
        correctIndex: 0,
        explanation: "Since they average history, they can only confirm moves that have already occurred.",
      },
      {
        id: "sma-ema-q3",
        prompt: "What often happens to moving averages in sideways markets?",
        options: [
          "They work perfectly",
          "Price crosses them repeatedly, creating misleading signs",
          "They disappear",
          "They become volume indicators",
        ],
        correctIndex: 1,
        explanation: "Without a clear direction, price oscillates around the average, which creates frequent false alerts.",
      },
    ],
  },
  {
    id: "golden-death-cross",
    trackId: "technical-analysis",
    order: 3,
    title: "Golden cross and death cross",
    summary: "What happens when a short and a long moving average cross.",
    minutes: 4,
    body: `## What it is

A moving average crossover occurs when a shorter average crosses a longer one. Two well known versions use the 50-day and 200-day averages:

- Golden cross: the 50-day average crosses above the 200-day average.
- Death cross: the 50-day average crosses below the 200-day average.

The names are dramatic, but the mechanism is simple: when recent prices have risen enough for the short average to overtake the long one, the cross appears, and the reverse for a fall.

## How to read it

People interpret a golden cross as a sign that momentum has turned positive over the medium term, and a death cross as the opposite. However, remember what the cross is made of: both lines are averages of past prices. By the time the cross happens, a significant part of the price move has typically already taken place. The cross is a lagging confirmation, not a forecast.

Research and market history show mixed results. Crosses have preceded both continued moves and sharp reversals, and in sideways markets they can occur repeatedly with little follow-through, a pattern called whipsaw. Crosses are not reliable signals by themselves, and past behavior around crosses does not predict what will happen next.

Useful questions when you see one:

- What was the preceding price move, and how much of it has already happened?
- Is the market trending or moving sideways?
- What do fundamentals and other context say?
- How does it look on other time frames?

For example, after a long decline the 50-day average may cross above the 200-day when the price has already recovered a good part of its fall. The signal arrives late by construction.

The example ticker in the live widget is only an illustration.

## Common mistake

Treating a cross as an instruction to act. It is a description of the relationship between two averages, with a built-in delay. Another mistake is cherry-picking famous past crosses that worked, while forgetting the many that did not.`,
    liveExample: {
      id: "moving-averages",
      ticker: "SPY",
      caption: "See where the 50-day and 200-day averages cross on an example one-year chart, and whether a crossover happened recently.",
    },
    glossaryIds: ["ma-crossover", "sma", "ema"],
    quiz: [
      {
        id: "golden-death-cross-q1",
        prompt: "What is a golden cross?",
        options: [
          "The 50-day average crossing above the 200-day average",
          "The 200-day average crossing above the price",
          "A price of exactly 100",
          "A rise in volume",
        ],
        correctIndex: 0,
        explanation: "It is the short average overtaking the long average from below.",
      },
      {
        id: "golden-death-cross-q2",
        prompt: "Why is a cross considered a lagging signal?",
        options: [
          "Both averages are built from past prices, so the move has usually already happened",
          "It is computed from future prices",
          "It only happens on holidays",
          "It ignores price",
        ],
        correctIndex: 0,
        explanation: "The averages need time to catch up with price, so the cross confirms rather than anticipates.",
      },
      {
        id: "golden-death-cross-q3",
        prompt: "What is a whipsaw?",
        options: [
          "A steady uptrend",
          "Repeated crossovers with little follow-through in a choppy market",
          "A type of dividend",
          "A volume spike",
        ],
        correctIndex: 1,
        explanation: "In sideways markets, averages cross back and forth, producing signals that quickly reverse.",
      },
    ],
  },
  {
    id: "rsi-lesson",
    trackId: "technical-analysis",
    order: 4,
    title: "RSI: relative strength index",
    summary: "A momentum oscillator that compares recent gains with recent losses.",
    minutes: 5,
    body: `## What it is

The Relative Strength Index (RSI) is a momentum indicator that oscillates between 0 and 100. It compares the size of recent price gains with recent losses, usually over 14 periods. A high value means that gains have dominated recently, and a low value means that losses have.

## How to read it

Common reference levels are:

- Above 70: often called overbought, meaning the price rose strongly and quickly.
- Below 30: often called oversold, meaning it fell strongly and quickly.
- Around 50: balanced momentum.

These labels are easily misunderstood. "Overbought" does not mean the price must fall, and "oversold" does not mean it must rise. In a strong trend, RSI can stay above 70 or below 30 for long periods, while the price keeps moving in the same direction. The indicator measures the speed of recent moves, not whether a price is too high or too low in value terms.

Another concept is divergence: the price makes a new high but RSI does not, which some analysts view as weakening momentum. Divergences also fail often, and they can last a long time before anything changes.

RSI is calculated entirely from past prices. It is not a reliable signal by itself. It is better used as a descriptive gauge of momentum, combined with trend context, volume, fundamentals and your own risk limits. Past performance does not predict future results.

The live example shows the current RSI for an example ticker next to its price. The ticker is an illustration only.

For instance, if a stock rose on 12 of the last 14 days, RSI will probably be high, which simply tells you the recent run was strong, not what comes next.

## Common mistake

Reading 70 and 30 as automatic sell and buy triggers. These thresholds are conventions, not laws, and they behave differently in trending and range-bound markets. Another mistake is using a single time frame, when RSI can show different readings on daily and weekly charts.`,
    liveExample: {
      id: "rsi",
      ticker: "AAPL",
      caption: "See the 14-period RSI for an example ticker and how long it stays above 70 or below 30.",
    },
    glossaryIds: ["rsi", "volatility", "volume"],
    quiz: [
      {
        id: "rsi-lesson-q1",
        prompt: "What does an RSI above 70 mean?",
        options: [
          "The price must fall",
          "Recent gains have been strong relative to losses",
          "The company is overvalued",
          "Volume is high",
        ],
        correctIndex: 1,
        explanation: "RSI measures the strength of recent moves. It says nothing certain about the next move or about value.",
      },
      {
        id: "rsi-lesson-q2",
        prompt: "In a strong uptrend, what can happen to RSI?",
        options: [
          "It cannot exceed 50",
          "It can remain above 70 for a long time",
          "It becomes negative",
          "It stops working",
        ],
        correctIndex: 1,
        explanation: "Persistent gains keep RSI high, which is why overbought readings are not sell signals by themselves.",
      },
      {
        id: "rsi-lesson-q3",
        prompt: "Which is the most reasonable use of RSI?",
        options: [
          "As a descriptive momentum gauge alongside other information",
          "As a guaranteed prediction",
          "As a replacement for analyzing the company",
          "As a measure of dividends",
        ],
        correctIndex: 0,
        explanation: "RSI summarizes past momentum. It is helpful context, not a reliable signal by itself.",
      },
    ],
  },
  {
    id: "macd-lesson",
    trackId: "technical-analysis",
    order: 5,
    title: "MACD",
    summary: "Momentum from the gap between two moving averages.",
    minutes: 5,
    body: `## What it is

MACD stands for Moving Average Convergence Divergence. It is built from exponential moving averages (EMA) and has three parts:

- The MACD line: the 12-period EMA minus the 26-period EMA.
- The signal line: a 9-period EMA of the MACD line.
- The histogram: the difference between the MACD line and the signal line, drawn as bars.

When the short EMA is far above the long one, the MACD line is positive and high, showing that prices have risen faster recently. When the two EMAs converge, MACD approaches zero.

## How to read it

Typical descriptions:

- The MACD line crossing above the signal line is called a bullish crossover, and below it a bearish crossover.
- The MACD line above zero indicates that the short-term average is above the long-term one, and below zero the opposite.
- A shrinking histogram shows that momentum is fading, even if the price is still rising.
- Divergence between MACD and price is sometimes discussed as a warning of changing momentum.

Since MACD is derived from moving averages, it inherits their delay. Crossovers often come after a move is already underway, and in sideways markets the lines cross frequently, generating signals that do not lead anywhere.

It is also a relative measure: the MACD value depends on the price level, so values cannot be compared directly between securities with different prices.

MACD is not a reliable signal by itself. It describes momentum in past data and should be considered with the broader trend, volume, the company's fundamentals and your risk tolerance. Past performance does not predict future results.

The example ticker in the live widget is an illustration, not a suggestion.

For instance, if the 12-period EMA is 105 and the 26-period EMA is 100, the MACD line is 5. If it was 8 last week, momentum has cooled even though the short EMA remains higher.

## Common mistake

Trading every crossover as if it were a confirmed trend change. Many crossovers fail, especially in range-bound markets. Another mistake is adjusting the 12, 26 and 9 settings until they fit the past perfectly, which is called overfitting and rarely holds up on new data.`,
    liveExample: {
      id: "macd",
      ticker: "MSFT",
      caption: "See MACD, its signal line and histogram for an example ticker.",
    },
    glossaryIds: ["macd", "ema", "ma-crossover"],
    quiz: [
      {
        id: "macd-lesson-q1",
        prompt: "How is the MACD line calculated?",
        options: [
          "12-period EMA minus 26-period EMA",
          "Price divided by volume",
          "26-period SMA plus 12-period SMA",
          "The highest price minus the lowest",
        ],
        correctIndex: 0,
        explanation: "MACD measures the gap between a faster and a slower exponential average.",
      },
      {
        id: "macd-lesson-q2",
        prompt: "A shrinking MACD histogram while price still rises suggests what?",
        options: [
          "Momentum is slowing, though it does not tell the price will fall",
          "The price will fall tomorrow",
          "The company is cheap",
          "Volume doubled",
        ],
        correctIndex: 0,
        explanation: "The histogram shows the gap between MACD and its signal. A smaller gap means weaker momentum, not a certain reversal.",
      },
      {
        id: "macd-lesson-q3",
        prompt: "Why do MACD crossovers often come late?",
        options: [
          "It is based on moving averages of past prices",
          "It uses future prices",
          "It ignores price",
          "It is updated monthly",
        ],
        correctIndex: 0,
        explanation: "Moving averages lag price, so the indicators built on them lag too.",
      },
    ],
  },
  {
    id: "bollinger-bands-lesson",
    trackId: "technical-analysis",
    order: 6,
    title: "Bollinger Bands",
    summary: "A moving average with bands that widen and narrow with volatility.",
    minutes: 4,
    body: `## What it is

Bollinger Bands consist of three lines drawn around the price:

- A middle line: usually a 20-period simple moving average.
- An upper band: the middle line plus two standard deviations.
- A lower band: the middle line minus two standard deviations.

Standard deviation is a measure of how widely prices vary. When volatility rises, the bands widen. When it falls, they narrow. Statistically, a large share of prices usually falls within the bands, but price can and does move outside them.

## How to read it

The bands are mainly a way to see volatility and relative position:

- Price near the upper band means it is high relative to its recent average, and near the lower band means it is low relative to it.
- Narrow bands (a squeeze) show a period of low volatility. Volatility tends to alternate between calm and active phases, but the squeeze does not tell you the direction of the next move.
- Wide bands show high recent volatility.

Touching the upper band is not a sell signal and touching the lower is not a buy signal. In a strong trend, price can "walk the band" for a long time. In a range, price often bounces between bands, which is why the same pattern can be read in opposite ways.

Bollinger Bands are calculated from past data and are not reliable signals by themselves. Use them as a visual aid for volatility, combined with trend, volume, fundamentals and your own risk limits. Past performance does not predict future results.

For example, if a stock has been moving 1% a day and suddenly moves 5%, the bands widen quickly after that, reflecting the change in volatility rather than predicting more of it.

The live example uses an example ticker, for illustration only.

## Common mistake

Assuming that price must return to the middle after touching a band. This can happen, but a break outside the band can also mark the start of a strong move. Another mistake is ignoring the market context: the same band touch means different things in trending and sideways markets.`,
    liveExample: {
      id: "bollinger",
      ticker: "AAPL",
      caption: "Watch the bands widen and narrow as volatility changes on an example chart.",
    },
    glossaryIds: ["bollinger-bands", "volatility", "sma"],
    quiz: [
      {
        id: "bollinger-bands-lesson-q1",
        prompt: "What happens to Bollinger Bands when volatility rises?",
        options: ["They widen", "They narrow", "They disappear", "They turn horizontal"],
        correctIndex: 0,
        explanation: "The bands are based on standard deviation, which increases when prices vary more.",
      },
      {
        id: "bollinger-bands-lesson-q2",
        prompt: "What does a squeeze (narrow bands) tell you?",
        options: [
          "Volatility has been low, but not the direction of the next move",
          "Prices will rise",
          "Prices will fall",
          "The company will pay a dividend",
        ],
        correctIndex: 0,
        explanation: "A squeeze shows calm conditions. It says nothing about which way price will move afterwards.",
      },
      {
        id: "bollinger-bands-lesson-q3",
        prompt: "Why is touching the upper band not an automatic sell signal?",
        options: [
          "In strong trends price can stay near the band for a long time",
          "The upper band does not exist",
          "Bands are only decorative",
          "Prices never touch the band",
        ],
        correctIndex: 0,
        explanation: "Strong trends can keep price at the band, so a touch alone does not indicate a reversal.",
      },
    ],
  },
  {
    id: "volume-lesson",
    trackId: "technical-analysis",
    order: 7,
    title: "Volume",
    summary: "How many shares traded, and what that adds to a price move.",
    minutes: 4,
    body: `## What it is

Volume is the number of shares traded during a period. It is usually shown as bars under the price chart. Average volume, for example over 50 days, gives a normal level to compare against.

Price tells you where trading happened. Volume tells you how much activity was behind it.

## How to read it

Typical readings:

- A price move on high volume, relative to average, involves more participants and is often seen as more significant than the same move on low volume.
- A move on very low volume may reflect few participants, so it can be less reliable and easier to reverse.
- A spike in volume often accompanies news, earnings releases, index changes or large investors entering or leaving.
- Low average volume also means low liquidity: it can be harder to buy or sell without moving the price, and the spread tends to be wider.

Relative volume, which compares today's volume with the average, is more informative than the raw number because normal levels differ greatly between companies.

Volume has caveats. A rise may come from buyers or sellers, and volume alone does not say which. Some days are naturally heavy, such as when indices rebalance or options expire. Volume also differs between exchanges, so published figures may or may not include all trading venues.

Volume is not a reliable signal by itself. It adds context to price patterns and should be combined with other analysis and your own risk limits. Past patterns do not predict future results.

For example, if a stock usually trades 2 million shares a day and trades 8 million after a news release, relative volume is 4 times normal, meaning unusual interest. It does not tell you the direction of what follows.

The example ticker in the live widget is an illustration only.

## Common mistake

Reading high volume as bullish or bearish by itself. Heavy volume can accompany both rallies and sell-offs. Another mistake is overlooking liquidity: thinly traded securities can have price moves that look dramatic but involve very few shares.`,
    liveExample: {
      id: "volume",
      ticker: "MSFT",
      caption: "Compare today's volume with its average for an example ticker.",
    },
    glossaryIds: ["volume", "average-volume", "short-interest"],
    quiz: [
      {
        id: "volume-lesson-q1",
        prompt: "Why is relative volume more informative than raw volume?",
        options: [
          "It compares activity with the security's own normal level",
          "It removes the price",
          "It is always higher",
          "It is required by law",
        ],
        correctIndex: 0,
        explanation: "Normal volume varies by company, so a number only means something relative to its average.",
      },
      {
        id: "volume-lesson-q2",
        prompt: "Heavy volume appears during a sharp price move. What does it tell you?",
        options: [
          "Many participants were involved, but not by itself the direction of what follows",
          "The price will continue in the same direction",
          "The price will reverse",
          "The company is profitable",
        ],
        correctIndex: 0,
        explanation: "Volume measures participation. It adds weight to a move but does not predict the next one.",
      },
      {
        id: "volume-lesson-q3",
        prompt: "What is a consequence of low volume in a security?",
        options: [
          "Lower liquidity and potentially wider spreads",
          "Guaranteed price stability",
          "No risk",
          "Higher dividends",
        ],
        correctIndex: 0,
        explanation: "With fewer participants, trading can move the price more and costs rise.",
      },
    ],
  },
  {
    id: "support-resistance-lesson",
    trackId: "technical-analysis",
    order: 8,
    title: "Support and resistance",
    summary: "Price areas where moves have paused or reversed before.",
    minutes: 4,
    body: `## What it is

Support is a price area where a decline has previously slowed or reversed. Resistance is a price area where a rise has previously stalled or reversed. They are drawn as horizontal lines or zones through earlier highs and lows.

The idea behind them is behavioral: many people remember past prices and may react when the price returns there, for example by adding to positions, closing them or placing orders around round numbers.

## How to read it

Some practical observations:

- Zones work better than exact lines. Price rarely turns at exactly the same value, so analysts use a band.
- The more times a level has been tested, and the more volume it had, the more attention it tends to get.
- When price breaks through a level, it is sometimes said that support becomes resistance, or the reverse. This is a common description rather than a rule.
- Round numbers and previous highs and lows are frequently watched levels.

Levels are identified in hindsight, which creates a risk: with enough lines drawn on a chart, price will appear to respect some of them. Two people can mark different levels on the same chart.

Levels also fail. A breakout can reverse quickly (a false breakout), and prices can pass through a level without pausing at all.

Support and resistance are not reliable signals by themselves. They are a framework for describing where activity has concentrated. Use them with trend, volume, fundamentals and your own risk limits. Past performance does not predict future results.

For example, if a stock repeatedly stopped falling near 50 over the last year, 50 may be called support. If it then closes well below 50, that area has failed as support, and the history of the level does not protect against further falls.

The example ticker is an illustration only.

## Common mistake

Treating a level as a barrier that must hold. Levels reflect past reactions, not future ones. Another mistake is redrawing lines after the fact to fit the price, which makes the method appear more accurate than it is.`,
    liveExample: {
      id: "support-resistance",
      ticker: "AAPL",
      caption: "Spot price zones that have been tested several times on an example chart.",
    },
    glossaryIds: ["support-resistance", "volume", "sma"],
    quiz: [
      {
        id: "support-resistance-lesson-q1",
        prompt: "What is a resistance level?",
        options: [
          "An area where a rise has previously stalled",
          "A price floor guaranteed by the exchange",
          "The company's debt limit",
          "The dividend date",
        ],
        correctIndex: 0,
        explanation: "Resistance is a zone where upward moves have previously stopped, drawn from past price history.",
      },
      {
        id: "support-resistance-lesson-q2",
        prompt: "Why are levels better treated as zones than exact lines?",
        options: [
          "Price rarely reverses at the exact same value",
          "Because lines are illegal",
          "Because zones are always accurate",
          "Because exact prices do not exist",
        ],
        correctIndex: 0,
        explanation: "Reactions are spread around an area, so a band describes them more realistically.",
      },
      {
        id: "support-resistance-lesson-q3",
        prompt: "What can happen to a support level?",
        options: [
          "It can fail, and price can fall through it",
          "It can never be broken",
          "It is protected by regulators",
          "It becomes a dividend",
        ],
        correctIndex: 0,
        explanation: "Levels are based on past behavior and carry no guarantee, so they can and do break.",
      },
    ],
  },
  {
    id: "timeframes",
    trackId: "technical-analysis",
    order: 9,
    title: "Time frames",
    summary: "Why the same chart tells different stories at different scales.",
    minutes: 4,
    body: `## What it is

A time frame is the period each candle or data point represents: one minute, one hour, one day, one week or one month. The time frame you choose changes what you see. A security can appear to be in a steady uptrend on a weekly chart and in a sharp decline on a five-minute chart at the same moment.

## How to read it

Think of time frames as zoom levels:

- Short time frames (minutes to hours) show a lot of detail and noise. They are used by people who trade frequently, and they involve higher trading costs and more random fluctuations.
- Medium time frames (daily) are a common middle ground for reviewing price behavior.
- Long time frames (weekly, monthly) smooth noise and are more relevant for long-term investors.

Some analysts use multiple time frames: they check a longer one to understand the broader context, and a shorter one for more detail. If signals on different time frames disagree, the picture is simply mixed.

Indicator settings are also tied to time frames. A 14-period RSI on a daily chart covers 14 days, while on a weekly chart it covers 14 weeks. The same indicator can show opposing readings on different scales, which is a reminder that indicators are not reliable signals by themselves.

Your time frame should match your own horizon and goals. An investor planning to hold for ten years has little reason to be guided by five-minute moves, and frequent checking of short-term charts can increase emotional reactions.

Prices over longer periods have generally smoothed out some noise, but they carry no guarantee about the future, and past performance does not predict future results.

The example ticker is an illustration only.

## Common mistake

Switching time frames until you find the one that confirms what you already believe. This is a form of confirmation bias. Another mistake is mixing horizons, for example buying with a long-term plan but making decisions based on short-term fluctuations.`,
    liveExample: {
      id: "moving-averages",
      ticker: "SPY",
      caption: "See a one-year daily view of an example chart. Other timeframes show different patterns; the Technicals tab of any stock lets you change the period.",
    },
    glossaryIds: ["volatility", "rsi", "sma"],
    quiz: [
      {
        id: "timeframes-q1",
        prompt: "What is a time frame on a chart?",
        options: [
          "The period each candle represents",
          "The date of the next dividend",
          "The trading hours of an exchange",
          "The age of the company",
        ],
        correctIndex: 0,
        explanation: "Each candle summarizes a set period, such as a day or a week, which sets the scale of what you see.",
      },
      {
        id: "timeframes-q2",
        prompt: "The daily and weekly charts of the same stock give opposite readings. What does this show?",
        options: [
          "Charts are broken",
          "Signals depend on the time frame, so the overall picture is mixed",
          "The weekly chart is always right",
          "The daily chart is always right",
        ],
        correctIndex: 1,
        explanation: "Different scales highlight different movements, and disagreement is a sign of ambiguity, not an error.",
      },
      {
        id: "timeframes-q3",
        prompt: "What is a good way to choose a time frame?",
        options: [
          "The one that confirms your opinion",
          "The one that matches your own investment horizon",
          "The shortest available",
          "Whichever shows the highest return",
        ],
        correctIndex: 1,
        explanation: "Matching your horizon avoids reacting to noise that is irrelevant to your goals and avoids confirmation bias.",
      },
    ],
  },
  {
    id: "limits-of-ta",
    trackId: "technical-analysis",
    order: 10,
    title: "The limits of technical analysis",
    summary: "What chart-based tools can and cannot tell you.",
    minutes: 5,
    body: `## What it is

Technical analysis studies price and volume history to describe market behavior. Its tools, such as trends, averages, RSI, MACD and Bollinger Bands, are useful for summarizing what has happened and how the market has behaved. They are not a method that guarantees outcomes.

Anyone using these tools should understand their limits, which is as important as understanding how to calculate them.

## How to read it

Key limitations to keep in mind:

- Indicators are derived from past prices. Most lag, and none know about future news, earnings or events.
- They are not reliable signals by themselves. Studies of technical rules have produced mixed and often weak results, especially after costs.
- Interpretation is subjective. Different people draw different lines and read the same pattern in opposite ways.
- Hindsight bias: patterns look obvious after the fact. Real-time uncertainty is much greater.
- Overfitting: tuning rules to fit past data often produces rules that fail on new data. A strategy that looks perfect on history may be coincidence.
- Survivorship and selection: examples shown in books and social media tend to be those that worked.
- Many indicators are built from the same inputs (price and volume), so combining several does not give as much independent confirmation as it seems.

A debated question is whether prices already reflect available information, in which case chart patterns would add little. Evidence and opinions differ, and this lesson takes no side. What can be said is that past performance does not predict future results.

A balanced use is descriptive: understanding volatility, trends and how far price has moved, while keeping in mind fundamentals, diversification, costs and your own risk tolerance.

Example tickers in this course are illustrations and not recommendations.

## Common mistake

Looking for certainty. Adding more indicators to a chart can create a feeling of precision while the underlying uncertainty remains. Another mistake is ignoring costs and taxes of frequent trading, which can erase the small edge a rule appears to have. Be skeptical of anyone promising a pattern that always works.`,
    liveExample: {
      id: "rsi",
      ticker: "AAPL",
      caption: "See how the RSI of an example ticker can stay above 70 or below 30 for long stretches. A single indicator is not a forecast.",
    },
    glossaryIds: ["rsi", "macd", "bollinger-bands", "sma", "volatility"],
    quiz: [
      {
        id: "limits-of-ta-q1",
        prompt: "Why does adding more indicators not necessarily give independent confirmation?",
        options: [
          "Many indicators are built from the same price and volume data",
          "Indicators use different universes of data",
          "Indicators are random",
          "More indicators always increase accuracy",
        ],
        correctIndex: 0,
        explanation: "If they all derive from the same past prices, they tend to agree for the same reason, so agreement is less informative than it looks.",
      },
      {
        id: "limits-of-ta-q2",
        prompt: "What is overfitting in this context?",
        options: [
          "Tuning rules to past data so they look perfect but fail on new data",
          "Buying too many shares",
          "Using a very long moving average",
          "Choosing a weekly chart",
        ],
        correctIndex: 0,
        explanation: "A rule that matches history through many adjustments may only be capturing coincidence.",
      },
      {
        id: "limits-of-ta-q3",
        prompt: "Which is the most accurate way to describe technical indicators?",
        options: [
          "Descriptive tools based on past data, not reliable signals by themselves",
          "Tools that predict prices with certainty",
          "Tools that replace risk management",
          "Only useful for dividends",
        ],
        correctIndex: 0,
        explanation: "They summarize history and need context. Past performance does not predict future results.",
      },
    ],
  },
];
