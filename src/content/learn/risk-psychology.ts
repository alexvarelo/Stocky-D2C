import type { Lesson } from "./types";

export const RISK_PSYCHOLOGY_LESSONS: Lesson[] = [
  {
    id: "beta-lesson",
    trackId: "risk-psychology",
    order: 1,
    title: "Beta",
    summary: "How sensitive a stock has been to movements of the market.",
    minutes: 4,
    body: `## What it is

Beta measures how much a security's returns have moved relative to the market, usually an index like the S&P 500, over a past period. The market itself has a beta of 1.

- Beta of 1: it has tended to move in line with the market.
- Beta above 1: it has tended to move more than the market, in both directions.
- Beta below 1: it has tended to move less.
- Negative beta: it has tended to move in the opposite direction, which is rare.

## How to read it

If a stock has a beta of 1.5 and the market rises 10%, the stock has historically tended to rise about 15%. If the market falls 10%, it has tended to fall about 15%. Beta therefore describes amplification of market moves, not only risk of loss.

Several limits apply:

- Beta is calculated from past data and depends on the period, the data frequency and the benchmark chosen. The same stock can show different betas under different settings.
- It captures only the part of movement tied to the market. A company can have a low beta and still be very risky because of its own problems, such as a failed product or high debt.
- It changes over time as the business, its debt and the market change.
- It is a statistical estimate, and its fit is imperfect. Check how strongly the stock actually correlates with the benchmark.

Beta also helps think at portfolio level: a portfolio's beta is the weighted average of its holdings' betas, and it summarizes how sensitive the whole portfolio may be to market moves.

Past behavior does not predict future results, so beta is a description of history and not a promise about how a stock will react next time.

The live example shows the beta of an example ticker, for illustration and not a recommendation.

## Common mistake

Equating low beta with low risk, or high beta with "bad". Beta measures sensitivity to the market, not total risk. Volatility, leverage and concentration also matter. Another error is using a beta computed against a benchmark that does not suit the stock, such as a US index for a company mostly active in another region.`,
    liveExample: {
      id: "beta",
      ticker: "KO",
      caption: "See the beta of an example ticker against the S&P 500.",
    },
    glossaryIds: ["beta", "volatility", "correlation", "benchmark"],
    quiz: [
      {
        id: "beta-lesson-q1",
        prompt: "A stock has a beta of 1.5. If the market has risen 10%, what has this stock historically tended to do?",
        options: ["Rise about 15%", "Rise about 5%", "Rise exactly 10%", "Fall 15%"],
        correctIndex: 0,
        explanation: "A beta of 1.5 means it has tended to amplify market moves by about 50%, in both directions.",
      },
      {
        id: "beta-lesson-q2",
        prompt: "Why does low beta not mean low risk?",
        options: [
          "Beta only captures sensitivity to the market, not company-specific risks",
          "Beta includes all risks",
          "Low beta means a guaranteed return",
          "Beta is a tax",
        ],
        correctIndex: 0,
        explanation: "A company can face large problems of its own that do not depend on the market, and beta does not reflect them.",
      },
      {
        id: "beta-lesson-q3",
        prompt: "Why can the same stock show different betas?",
        options: [
          "Beta depends on the period, data frequency and benchmark used",
          "Stocks change names",
          "Beta is random",
          "Betas are fixed by law",
        ],
        correctIndex: 0,
        explanation: "It is a statistical estimate from past data, so the settings matter and it changes over time.",
      },
    ],
  },
  {
    id: "diversification-correlation",
    trackId: "risk-psychology",
    order: 2,
    title: "Diversification and correlation",
    summary: "Why combining assets that do not move together can reduce portfolio swings.",
    minutes: 5,
    body: `## What it is

Correlation measures how two assets' returns move relative to each other, on a scale from -1 to +1:

- +1: they move together perfectly.
- 0: no consistent relationship.
- -1: they move in exactly opposite directions.

In practice, most stocks have positive correlation because they respond to the same economy. Very low or negative correlations between assets are less common.

## How to read it

Correlation explains why diversification works. Combining two assets with a correlation below 1 produces a portfolio whose volatility is lower than the weighted average of the two. The lower the correlation, the stronger the effect. Two assets with correlation of +1 provide no volatility reduction at all.

Key points when using correlations:

- They are estimated from past data and change over time. Relationships can be stable for years and then shift.
- They tend to rise in market stress. When markets fall sharply, many assets fall together, so diversification can disappoint when it is most needed.
- Correlation says nothing about the size of moves, only the tendency to move in the same direction.
- A correlation matrix of your holdings highlights hidden concentration, such as several names that all follow the same theme.

Diversification reduces the risk specific to individual holdings, but it cannot remove the risk that affects the whole market. It also does not guarantee a profit or protect against loss.

Past correlations do not predict future ones, and the live example is only a snapshot of history.

The example tickers are for illustration only and are not personal advice.

## Common mistake

Believing that holding many assets automatically means being diversified. If they are highly correlated, the portfolio behaves like a single bet. Another mistake is assuming that today's low correlation will hold in a crisis. Reviewing correlations periodically, and particularly looking at how they behaved in previous downturns, gives a more cautious picture.`,
    liveExample: {
      id: "correlation",
      caption: "View the correlation between two tickers of your choice over the last year (SPY by default).",
    },
    glossaryIds: ["correlation", "diversification", "effective-positions", "concentration-hhi"],
    quiz: [
      {
        id: "diversification-correlation-q1",
        prompt: "Which pair offers the most volatility reduction when combined?",
        options: [
          "Two assets with correlation +1",
          "Two assets with correlation 0.2",
          "Two copies of the same asset",
          "Two assets with correlation 0.95",
        ],
        correctIndex: 1,
        explanation: "The lower the correlation, the more the swings of one asset offset those of the other.",
      },
      {
        id: "diversification-correlation-q2",
        prompt: "What often happens to correlations during sharp market sell-offs?",
        options: [
          "They tend to rise",
          "They always drop to zero",
          "They become negative",
          "They disappear",
        ],
        correctIndex: 0,
        explanation: "Many assets fall together under stress, so diversification may protect less than expected.",
      },
      {
        id: "diversification-correlation-q3",
        prompt: "Two stocks have a correlation of 0. What does this mean?",
        options: [
          "No consistent relationship in their moves historically",
          "They always move in opposite directions",
          "Both are risk free",
          "They will have equal returns",
        ],
        correctIndex: 0,
        explanation: "Zero means that knowing one moved gives no consistent clue about the other, based on past data.",
      },
    ],
  },
  {
    id: "drawdowns",
    trackId: "risk-psychology",
    order: 3,
    title: "Drawdowns",
    summary: "How far an investment has fallen from a previous peak, and how long it took to recover.",
    minutes: 5,
    body: `## What it is

A drawdown is the decline from a previous peak to a later trough. The maximum drawdown is the largest such decline over a given period. If an investment rises to 100 and later falls to 70, the drawdown is 30%.

Drawdowns describe the losses an investor could have experienced in practice. Unlike volatility, which averages out ups and downs, a drawdown is a direct measure of how painful the worst stretch was.

## How to read it

Useful questions:

- How deep was the largest fall? A 50% decline is a very different experience from a 15% one.
- How long did the decline last, and how long was the recovery? Some drawdowns last years.
- How does the figure compare with the broader market over the same period?

Recovery math is asymmetric: a 30% fall requires a gain of about 43% to get back to the previous peak, and a 50% fall requires 100%. That is why large drawdowns are so costly.

Past drawdowns are a floor for thinking about risk, not a ceiling. A security with a maximum drawdown of 25% in the last five years could fall further in the future, especially if the period was unusually calm. Past performance does not predict future results.

Drawdowns are also useful for self-assessment. Imagine seeing a portfolio value drop by 30%. How would you react? If a fall of that size would make you sell in panic, the portfolio may be riskier than you can tolerate. Understanding your own tolerance in advance is part of risk management, and it is a personal matter that this lesson cannot assess for you.

The live example shows the drawdown history of an example ticker, for illustration only.

## Common mistake

Looking only at returns and ignoring the path. Two investments can end with the same return, but one may have required living through a 55% fall on the way. Another mistake is judging risk by a short, calm history, which underestimates how deep a decline can be.`,
    liveExample: {
      id: "drawdown",
      ticker: "SPY",
      caption: "See the maximum drawdown over the last year and how many days the price took to get back to its old high.",
    },
    glossaryIds: ["max-drawdown", "volatility", "sharpe-ratio", "sortino-ratio"],
    quiz: [
      {
        id: "drawdowns-q1",
        prompt: "An investment falls from 200 to 140. What is the drawdown?",
        options: ["30%", "60%", "43%", "70%"],
        correctIndex: 0,
        explanation: "The decline is 60 out of 200, which is 30%.",
      },
      {
        id: "drawdowns-q2",
        prompt: "What gain is needed after a 50% drawdown to return to the previous peak?",
        options: ["50%", "75%", "100%", "150%"],
        correctIndex: 2,
        explanation: "A value of 50 must double to return to 100, so a 100% gain is required.",
      },
      {
        id: "drawdowns-q3",
        prompt: "Why is a past maximum drawdown not an upper limit on future losses?",
        options: [
          "Past results do not predict future ones, and the history may have been unusually calm",
          "Drawdowns never repeat",
          "It is a legal cap",
          "It is always the worst possible case",
        ],
        correctIndex: 0,
        explanation: "Future declines can exceed anything seen in a limited sample, so history is only a reference point.",
      },
    ],
  },
  {
    id: "averaging-down",
    trackId: "risk-psychology",
    order: 4,
    title: "Averaging down",
    summary: "Buying more of a falling holding to lower the average cost, and why it deserves care.",
    minutes: 4,
    body: `## What it is

Averaging down means adding to a position after its price has fallen, so that the average cost per share declines. For example, if you bought 10 shares at 100 and then 10 more at 60, your average cost is 80 per share, and the price only needs to recover to 80, not 100, to reach break-even.

This lesson explains the mechanism and its pitfalls. It is not a recommendation to do it or avoid it.

## How to read it

The arithmetic works, but it can mislead decisions in several ways:

- The average cost is a fact about your past, not about the company. The market does not know or care what you paid. A price at your break-even is not a reason in itself for it to go back there.
- Adding to a falling position increases the amount of money exposed to one holding. If the fall reflects a real deterioration of the business, the loss grows.
- It can concentrate the portfolio: a holding that was 5% of the total may become 12% after repeated additions.
- The question to ask is the same as for any new purchase: given what I know now, would I be comfortable starting a position of this size today? That reframing separates the analysis of the company from the wish to recover a loss.

A related but different approach is dollar-cost averaging, investing a fixed amount at regular intervals regardless of price, which follows a plan set in advance rather than reacting to a decline. It does not remove risk or guarantee profits either.

There are legitimate reasons to add to a holding that has fallen, such as a thesis that is unchanged while the price is lower. The risk lies in doing it for emotional reasons, such as being unable to accept a loss.

Past performance does not predict future results, and examples here are not advice.

## Common mistake

Averaging down to "get back to even". This links the decision to your entry price, which is irrelevant to the company's prospects. Another mistake is doing it without limits, so that a single idea ends up dominating the portfolio. Setting maximum position sizes in advance helps avoid this.`,
    liveExample: {
      id: "drawdown",
      ticker: "SPY",
      caption: "See how far an example ticker fell from its previous high over the last year and how long it took to recover. A fall can go further than expected, and adding to a position raises exposure to it.",
    },
    glossaryIds: ["dollar-cost-averaging", "concentration-hhi", "rebalancing"],
    quiz: [
      {
        id: "averaging-down-q1",
        prompt: "You buy 10 shares at 100 and 10 more at 60. What is your average cost per share?",
        options: ["60", "80", "100", "160"],
        correctIndex: 1,
        explanation: "Total cost is 1,600 for 20 shares, so the average is 80 per share.",
      },
      {
        id: "averaging-down-q2",
        prompt: "Why is your break-even price not a good reason to expect a recovery?",
        options: [
          "The market does not depend on what you paid",
          "Break-even prices are always reached",
          "Break-even is illegal",
          "Prices follow your purchases",
        ],
        correctIndex: 0,
        explanation: "Your entry price says something about your history, and nothing about the company's prospects.",
      },
      {
        id: "averaging-down-q3",
        prompt: "Which question helps separate analysis from the wish to recover a loss?",
        options: [
          "How can I get my money back quickly?",
          "Given what I know now, would I start a position of this size today?",
          "What did I pay originally?",
          "What would others do?",
        ],
        correctIndex: 1,
        explanation: "It evaluates the holding on current information, removing the influence of the entry price.",
      },
    ],
  },
  {
    id: "loss-aversion-biases",
    trackId: "risk-psychology",
    order: 5,
    title: "Loss aversion and other biases",
    summary: "Common mental shortcuts that affect investing decisions.",
    minutes: 5,
    body: `## What it is

Behavioral finance studies how psychology affects financial decisions. Humans use mental shortcuts that are useful in daily life but can produce systematic errors with investments. Awareness of them does not remove them, but it can help you build habits that limit their impact.

Some well-documented biases:

- Loss aversion: losses feel stronger than gains of the same size. Research suggests losing 100 hurts roughly twice as much as gaining 100 feels good.
- Disposition effect: a tendency to sell winners too early and hold on to losers too long, to avoid realizing a loss.
- Confirmation bias: seeking information that supports what you already believe and discounting what contradicts it.
- Overconfidence: overestimating your knowledge or ability to predict outcomes, often leading to excessive trading.
- Recency bias: giving too much weight to recent events, assuming that the latest trend will continue.
- Herding: following the crowd, especially during booms and panics.
- Anchoring: relying too heavily on a reference point, such as the price you paid.

## How to read it

The practical value is in the process:

- Write down why you invest in something and what would change your mind, before emotions are involved.
- Set rules in advance for position size and review dates.
- Look for evidence that disagrees with your view.
- Limit how often you check prices, since frequent checking amplifies loss aversion.
- Keep a record of decisions and review them honestly, including the outcomes that were lucky.

These are examples of habits, and they are not a guarantee of better results. Being aware of biases does not make anyone immune, and these descriptions are general rather than a diagnosis of your behavior.

Past performance does not predict future results, and a good outcome does not prove a good decision, nor the opposite.

## Common mistake

Thinking biases only affect other people. Experienced professionals are also subject to them. Another mistake is treating a bad outcome as proof that the decision was wrong. Separating decision quality from results, which include chance, is a key part of learning.`,
    liveExample: {
      id: "volatility",
      ticker: "TSLA",
      caption: "See how large the yearly swings of an example ticker are. Bigger swings test emotional discipline more often.",
    },
    glossaryIds: ["rebalancing", "dollar-cost-averaging", "diversification"],
    quiz: [
      {
        id: "loss-aversion-biases-q1",
        prompt: "What is loss aversion?",
        options: [
          "Losses feel stronger than equivalent gains",
          "Avoiding all investments",
          "Preferring higher fees",
          "Ignoring losses",
        ],
        correctIndex: 0,
        explanation: "People tend to weigh losses more heavily than gains of the same size, which can distort decisions.",
      },
      {
        id: "loss-aversion-biases-q2",
        prompt: "Which behavior illustrates confirmation bias?",
        options: [
          "Reading mostly articles that agree with your existing view",
          "Checking several independent sources",
          "Writing down what would change your mind",
          "Reviewing past decisions",
        ],
        correctIndex: 0,
        explanation: "Confirmation bias is the preference for information that supports what you already think.",
      },
      {
        id: "loss-aversion-biases-q3",
        prompt: "Why separate decision quality from results?",
        options: [
          "Because outcomes also depend on chance, so a good result does not prove a good decision",
          "Because results never matter",
          "Because decisions are random",
          "Because luck does not exist",
        ],
        correctIndex: 0,
        explanation: "A well-reasoned choice can end badly, and a poor one can end well, so learning requires looking at the process.",
      },
    ],
  },
];
