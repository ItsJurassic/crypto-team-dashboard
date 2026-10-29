# Crypto Trading Strategy Playbook v1 (educational, paper trading only)
_Educational material, not financial advice. No strategy guarantees returns. Written 2026-10-28 (v1.16 same day: added Evidence 16, BTC Jun 2023-2025, and updated the BTC/ETH drawdown expectation and S1-W1 record; v1.14: S1 checked on two BTC cycles, two ETH cycles, XRP 2020-2023, SOL 2021-2023, DOGE 2020-2022, BNB 2020-2023, ADA 2020-2023, LINK 2019-2023, AVAX 2021-2023, DOT 2021-2023, LTC 2017-2019, BCH 2018-2019 and TRX 2018-2023; v1.15 updated S1-W1 after it reached 30 tagged trades and added S1-R7 drawdown length; v1.14 added G12 forks and chain splits; earlier added G11 slippage events, S1-R3, S1-R4, S1-R6 and watch item S1-W1; revised the rank 3-20 expectation) for a $2,000 paper portfolio limited to the top-20 coins by market cap._

## Global rules (apply to every trade)
- G1 Universe: only coins ranked top 20 by market cap at entry time; exclude stablecoins as trade targets.
- G2 Risk per trade: max 1% of equity ($20 at $2,000) between entry and stop, including estimated fees+slippage.
- G3 Position size = (equity x risk%) / (entry - stop). Cap any single position at 25% of equity; total open risk <= 5%.
- G4 Every trade must have a stop and a target/exit rule logged BEFORE entry.
- G5 Minimum planned reward:risk = 2:1 (after costs) for trend/breakout; 1.5:1 for mean reversion.
- G6 Cost model: assume 0.10% fee per side (taker ~0.1-0.6% depending on venue) + 0.05% slippage (top-5 coins) / 0.15% (rank 6-20). Skip trades where round-trip cost > 20% of planned reward.
- G7 Daily loss limit: stop opening trades after -3% equity in a day; weekly -6% -> pause and review.
- G8 Never widen a stop; only move it in the direction of the trade.
- G9 No leverage, no shorting in v1.
- G10 Journal every trade: strategy ID, timestamp, entry, stop, target, size, reason, fees, exit, R-multiple.
- G11 Slippage events (checkable): a stop is a trigger, not a guaranteed price. Any exit filled more than 0.5R worse than the planned stop is logged as a "slippage event" with the candle's low. The G3 25% position cap is the hard limit on a single-trade loss; never lift it because a stop is in place. (Evidence: GDAX ETH flash crash to $0.10 on 2017-06-21; see 2026-10-28-s1-trend-backtest-eth-2017-2018.md.)
- G12 Forks, chain splits and redenominations (checkable): before computing moving averages, highs or benchmarks across such an event, back-adjust pre-event prices by (post-event coin close / pre-event combined close on the last shared day) and log the event and factor in the journal. A price drop caused only by the unit change is not a stop hit or a loss; an open position records the value of every coin received. (Evidence: BCH 2018-11-15 split showed a stitched -30.5% day vs about -8% for a holder of both coins, and the stitched data put the 2019 golden cross 11 days late; see 2026-10-28-s1-trend-backtest-bch-2017-2019.md.)

## S1 Trend following (daily chart)
- Entry: close > 50-day SMA AND 50-day SMA > 200-day SMA AND 20-day close high made in last 5 days. Enter next open.
- Stop: initial = entry - 2 x ATR(14). Trailing: max(prior stop, highest close since entry - 3 x ATR(14)).
- Exit: trailing stop hit OR daily close < 50-day SMA.
- Sizing: G3 with 1% risk.
- Suitability: best fit for $2,000; few trades so fees are small. Expect many small losses and few large wins (win rate often 30-45%).
- Evidence (2026-10-28, BTC 2017-Mar 2019, in-sample): $2,000 -> $2,379 (+19%), max drawdown -4.5%, 16 trades, two trades made most of the profit; no entries after the 2018-03-31 death cross, so it sat out the -83% bear. Buy & hold +286% with ~-83% drawdown. See 2026-10-28-s1-trend-backtest-btc-2017.md.
- Evidence 2 (2026-10-28, BTC 2020-2022, rules unchanged since test 1): $2,000 -> $2,302 (+15%), max drawdown -3.8%, 15 trades (53% winners, avg +1.0R); no trades in 2022 after the 2022-01-15 death cross. Buy & hold +131% with -77% drawdown; weekly DCA -10%. See 2026-10-28-s1-trend-backtest-btc-2020-2022.md.
- Evidence 3 (2026-10-28, ETH 2017-2018, rules unchanged): $2,000 -> $2,567 (+28%), max drawdown -5.8%, 19 trades (37% winners, avg +1.4R, best +11.1R); last trade closed 2018-02-02, none after the 2018-04-10 death cross, so it sat out the -94% bust. Buy & hold ~17x from a near-bottom start with -94% drawdown; weekly DCA +82%. Included an 8-loss streak in Sept-Nov 2017. See 2026-10-28-s1-trend-backtest-eth-2017-2018.md.
- Evidence 4 (2026-10-28, ETH 2020-2022, rules unchanged): $2,000 -> $2,362 (+18%), max drawdown -3.9%, 18 trades (50% winners, avg +1.0R, best +5.8R); exited 2021-05-17 before the China-ban crash, no trades after the 2022-01-28 death cross. Buy & hold ~9x with -79% drawdown; weekly DCA +101%. See 2026-10-28-s1-trend-backtest-eth-2020-2022.md.
- Evidence 5 (2026-10-28, XRP 2020-2023, rules unchanged, first coin outside BTC/ETH): $2,000 -> $2,124 (+6%), max drawdown -12.5%, 22 trades (14% winners, avg +0.34R); two trades (+12.3R airdrop run, +7.2R April 2021 run) made all the profit, then 14 trades without a meaningful win. Buy & hold +220% with -83% drawdown; weekly DCA +53%. See 2026-10-28-s1-trend-backtest-xrp-2020-2023.md.
- Evidence 6 (2026-10-28, SOL Mar 2021-2023, rules unchanged, Binance SOL/USDT): $2,000 -> $2,824 (+41%, includes one open trade marked at the 2023-12-31 close at +23.2R), max drawdown -10.3%, 11 trades (45% winners, avg +3.5R); +16.5R on the Aug 2021 NFT run; zero trades in 2022, so it sat out Terra, FTX and the -96% slide; four quick losses in the 2023 cross whipsaw. Buy & hold +678% with -96% drawdown; weekly DCA +226%. See 2026-10-28-s1-trend-backtest-sol-2021-2023.md.
- Evidence 7 (2026-10-28, DOGE Jul 2020-2022, rules unchanged, Binance DOGE/USDT, first meme coin): $2,000 -> $2,450 (+22%), max drawdown -8.2%, 13 trades (46% winners, avg +1.7R); one trade (+19.8R, Apr 2021 run, stopped the day after the RSI-96 blow-off) made almost all the profit, the other 12 sum to about -0.9R; missed the Jan 2021 Reddit day; no trades from the Oct 2021 death cross to Nov 2022. Buy & hold +1,937% with -92% drawdown; weekly DCA +403%. See 2026-10-28-s1-trend-backtest-doge-2020-2022.md.
- Evidence 8 (2026-10-28, BNB Jul 2020-2023, rules unchanged, Binance BNB/USDT, first exchange token): $2,000 -> $2,727 (+36%, includes one open trade marked at the 2023-12-31 close at +4.3R), max drawdown -9.4%, 19 trades (42% winners, avg +1.9R); +33.5R on the Jan-Feb 2021 Smart Chain run, entered the day after a trailing-stop exit; equity marked at the 2021-02-19 blow-off ($2,889) was never regained through 2023; one 2022 trade (stopped on FTX day, -1.0R); small losses in the 2023 cross whipsaw. Buy & hold +1,718% with -71% drawdown; weekly DCA +166%. See 2026-10-28-s1-trend-backtest-bnb-2020-2023.md.
- Evidence 9 (2026-10-28, ADA Jul 2020-2023, rules unchanged, Binance ADA/USDT, run with saved script scholar/tools/s1_backtest.py): $2,000 -> $2,250 (+12.5%, includes one open trade marked at the 2023-12-31 close at +4.3R), max drawdown -5.7%, 19 closed trades (37% winners, avg +0.42R, best +5.8R); profit spread over three trades rather than one outlier; a tagged re-entry right after the Alonzo-top stop lost -1.0R; no trades from 2021-11-10 to 2023-03-22, so it sat out the -92% slide. Buy & hold +386% with -92% drawdown; weekly DCA +68%. See 2026-10-28-s1-trend-backtest-ada-2020-2023.md.
- Evidence 10 (2026-10-28, LINK Aug 2019-2023, rules unchanged, Binance LINK/USDT, saved script): $2,000 -> $2,200 (+10.0%), max drawdown -7.2%, 23 closed trades (35% winners, avg +0.43R, best +4.7R, sum +10.0R); profit from four mid-sized winners (2020 DeFi summer, Jan-Feb 2021, Oct-Nov 2023), no outlier; stopped out 2021-05-16, three days before the -38% China-ban day; no trades from 2021-11-16 to 2023-03-22, so it sat out the -90% slide; six losses in a row 2021-04 to 2023-04. Buy & hold +516% with -90% drawdown; weekly DCA +133%. See 2026-10-28-s1-trend-backtest-link-2019-2023.md.
- Evidence 11 (2026-10-28, AVAX Apr 2021-2023, rules unchanged, Binance AVAX/USDT, saved script): $2,000 -> $2,007 (+0.4%, includes one open trade marked at the 2023-12-31 close at +4.2R), max drawdown -6.4%, 12 closed trades (25% winners, avg -0.31R, sum -3.7R): the first test with a negative closed-trade total. The Feb 2021 bridge pump came before 200 days of history and the Aug 2021 Avalanche Rush run (3.4x in two weeks) came under a death cross, so S1 traded neither; stopped -1.0R on the 2021-05-19 China-ban day; sat out Terra, FTX and the -93% slide. Buy & hold +25% with -93.5% drawdown; weekly DCA +94%. See 2026-10-28-s1-trend-backtest-avax-2020-2023.md.
- Evidence 12 (2026-10-28, DOT Mar 2021-2023, rules unchanged, Binance DOT/USDT, saved script): $2,000 -> $2,021 (+1.1%, includes one open trade marked at the 2023-12-31 close at +4.3R), max drawdown -3.8%, 6 closed trades (1 winner, avg -0.53R, sum -3.2R); in a trade only 59 days. The Dec 2020-Feb 2021 run came before 200 days of history and the Jul-Nov 2021 rebound mostly under a death cross; stopped -1.0R twice in May 2021 (May top, China-ban day); the one winner (+1.0R) exited 2021-11-10, six days after the $53.82 top; no trades from 2021-11-10 to 2023-02-25, so it sat out the -93% slide. Buy & hold -76.7% with -93.2% drawdown; weekly DCA -2.9%. First test where S1 finished ahead of both buy & hold and DCA. See 2026-10-28-s1-trend-backtest-dot-2020-2023.md.
- Evidence 13 (2026-10-28, LTC Mar 2017-2019, rules unchanged, Coinbase LTC-USD, saved script): $2,000 -> $2,436 (+21.8%), max drawdown -7.6%, 18 closed trades (44% winners, avg +1.14R, best +11.7R, sum +20.6R); +11.7R on the Dec 2017 blow-off, exited four days after the top; no trades from 2018-02-23 to 2019-03-16, so it sat out the -94% bust; out by 2019-06-27, before the halving sell-off. Buy & hold +927% (from a $4 start) with -93.6% drawdown; weekly DCA -9.1%. See 2026-10-28-s1-trend-backtest-ltc-2017-2019.md.
- Evidence 14 (2026-10-28, BCH Feb 2018-2019, rules unchanged, Bitfinex BCH then ABC chain, saved script, run on stitched and back-adjusted data with identical trades): $2,000 -> $2,016 (+0.8%), max drawdown -1.6%, 1 closed trade (+0.8R, 2019-05-12 to 06-27); 200-day history only began 2018-02-17, after the 2017 top, so S1 missed the whole bull; flat through the 2018 bear, the hash-war split and the -75% month to the $78.5 low. Buy & hold -77.6% back-adjusted (-86.6% stitched) with -92.6% drawdown; weekly DCA -23.1% back-adjusted. Second test (after DOT) where S1 finished ahead of both. See 2026-10-28-s1-trend-backtest-bch-2017-2019.md.
- Evidence 15 (2026-10-28, TRX Dec 2018-2023, rules unchanged, Binance TRX/USDT, saved script): $2,000 -> $2,053 (+2.6%), max drawdown -7.0% but lasting from 2021-04-05 to 2023-04-30, 38 closed trades (the most of any test; 34% winners, avg +0.07R, best +4.0R, sum +2.8R), so roughly zero expectancy after costs; best trade a re-entry after a trailing-stop exit (2021-02-24 to 04-07, +4.0R). Buy & hold +438% with -78.2% drawdown; weekly DCA +217%, the widest gap to DCA of any test. See 2026-10-28-s1-trend-backtest-trx-2018-2023.md.
- Evidence 16 (2026-10-28, BTC Jun 2023-2025, first post-spot-ETF cycle, rules unchanged, Binance BTC/USDT via Sequoia, saved script): $2,000 -> $2,079 (+3.9%), max drawdown -6.3% (peak 2024-12-17, trough 2025-07-04; still below that high at 2025-12-31, about 380 days), 17 closed trades (18% winners, avg +0.25R, sum +4.2R); two +6.0R trades (Feb-Mar 2024 ETF run, Oct-Dec 2024 election run) made all the profit; five losses in a row near the $100k highs; stopped -0.5R on the 2025-10-10 liquidation crash with no slippage event. Buy & hold +107% with -32% drawdown; weekly DCA +15.8%. See 2026-10-28-s1-trend-backtest-btc-2023-2025.md.
- Expectation for rank 3-20 coins (revised after DOT): plan for a worst drawdown up to ~2x BTC/ETH (XRP -12.5%, SOL -10.3%, BNB -9.4%, DOGE -8.2%, LTC -7.6%, LINK -7.2%, AVAX -6.4%, ADA -5.7%, DOT -3.8%, BCH -1.6% vs up to 6.3% on BTC/ETH, BTC 2023-2025 being the deepest), and for a full cycle on one coin to end roughly flat (AVAX +0.4%, closed trades -3.7R; DOT +1.1%, closed trades -3.2R). On a coin that declines for most of the period, expect S1 to sit out and stay near flat while buy & hold and even weekly DCA lose money (DOT: -76.7% and -2.9%; BCH: -77.6% and -23.1%). Do not plan on a win rate: it ranged from 14% (XRP) to 46% (DOGE). On a coin that rises steadily with small moves, expect S1 to churn many small trades to about break-even and trail DCA by a wide margin (TRX: 38 trades, +2.6% vs DCA +217%). On these coins profit usually comes from one or two outlier trades (ADA and LINK were the exceptions: a few mid-sized winners and a small total, +12.5% and +10%); long losing streaks and whipsaw around repeated 50/200 crosses are normal for S1.
- S1-R4 (checkable): do not change, pause or abandon S1 on a coin because of a losing streak; judge it only under M8 (>= 30 trades) and S1-R3. Losing streaks are logged in the journal with their length (XRP history had 14 trades in a row without a meaningful win).
- S1-W1 watch item (journal tag, NOT an entry rule): tag every S1 entry made within 3 days after either a +30% daily close on that coin or an S1 trailing-stop exit (stop raised above its starting level) on that coin. Record so far (after BTC 2023-2025, 2026-10-28): 37 tagged trades, 27 losses, net about +43.9R; without the two outliers below the other 35 net about -1.1R (about break-even). BTC 2023-2025 added 3 tagged trades, all small losses (about -0.7R). After TRX it was 34 tagged trades, 24 losses, net about +44.6R. TRX's 11 tagged trades: 5 wins, 6 losses, about +5.6R, including its best trade (+4.0R). Earlier record (after LTC): 23 tagged trades, 18 losses, net about +39R, carried by two outliers: BNB's 2021-01-12 re-entry (+33.5R, the best trade in all thirteen tests) and LTC's 2017-11-30 re-entry (+11.7R); without those two the tagged trades net about -6R. LTC's 7 tagged trades: 3 wins, 4 losses, about +14.3R. All 4 ADA, all 3 LINK and the 1 AVAX tagged trades lost. Do not add a cooldown: in history it would have removed the biggest winner. The historical count passed 30 with TRX and the result is break-even outside the two outliers, so no change is made: keep tagging, no cooldown and no preference for re-entries; revisit only once Seedling's own paper trades add >= 30 tagged trades. Seedling takes these signals as normal. Willow reports the tagged trades' total R, not only their win rate.
- S1-R7 (checkable): every S1 review reports how many days S1 equity has been below its previous high, alongside drawdown depth. A long flat stretch alone is not a rule failure and is not a reason to change S1 (S1-R4). (Evidence: TRX drawdown was only -7.0% but lasted from 2021-04-05 to 2023-04-30.)
- S1-R6 (checkable): no S1 signal on a coin with fewer than 200 daily closes; the journal logs "insufficient history" instead of a trade. Missing a young coin's early run is accepted (AVAX: Feb 2021 pump before day 200).
- S1-R5 (checkable): reviews report closed-trade equity and open-trade (marked) equity separately; a drop in open profit after a blow-off is not counted as a rule failure. (BNB 2021-02-20: -8% account mark in one day from giving back open profit.)
- Four-test summary (BTC/ETH): 68 historical trades, ~+1.15R average, every test positive (+15% to +28%) with max drawdown under 6%, every test far behind buy & hold in bull phases. In-sample, BTC/ETH only; not a substitute for M8's 30 live paper trades.
- S1-R3 (checkable): every S1 review reports S1 return and max drawdown next to S4 weekly DCA over the same dates; S1 is judged on drawdown control first, not on beating DCA in a bull market.
- S1-R1 (checkable): no new S1 entry while the coin's 50-day SMA < 200-day SMA, even if the 20-day high condition fires.
- S1-R2 (checkable): do not raise risk above G2 to "catch more" of a rally; low exposure is the intended trade-off.

## S2 Breakout (Donchian, daily)
- Entry: daily close > highest high of prior 20 days AND volume > 1.5x 20-day average volume.
- Stop: lowest low of prior 10 days, or entry - 2 x ATR(14), whichever is closer (but not < 1 ATR).
- Exit: daily close < 10-day low (trailing) or target at 2R for half, trail the rest.
- Filter: skip if BTC close < its 200-day SMA (risk-off regime).
- Suitability: OK; false breakouts are common in crypto, so keep risk at 0.5-1%.

## S3 Mean reversion (RSI/Bollinger, 4h or daily)
- Entry: only when price > 200-day SMA (uptrend pullback). RSI(14) < 30 OR close below lower Bollinger Band (20, 2). Enter on next candle that closes back above the band.
- Stop: entry - 1.5 x ATR(14) or below the signal candle low.
- Exit: close at 20-period SMA (middle band) or RSI > 55; time stop 10 bars.
- Suitability: higher trade frequency -> fees matter; restrict to top-10 liquid coins. Crypto trends strongly, so never "average down".

## S4 Dollar-cost averaging (DCA) - baseline
- Rule: fixed amount on a fixed schedule (e.g. $50 weekly into BTC/ETH 60/40), regardless of price.
- No stop; exit only by pre-written rebalance plan (e.g. quarterly back to target weights).
- Use as benchmark: every active strategy should be compared vs DCA/buy-and-hold over the same period.
- Suitability: very suitable; minimize fees by using limit/maker orders, fewer larger buys.

## Position sizing worked example
Equity $2,000, risk 1% = $20. BTC entry $100,000, stop $96,000 (risk $4,000/coin = 4%). Size = 20/4000 = 0.005 BTC = $500 (25% cap OK). Costs ~0.3% round trip = $1.50 -> include in risk.

## Risk-reward and expectancy
- R = initial risk per unit. Expectancy = (win% x avg win R) - (loss% x avg loss R) - costs in R.
- Breakeven win rate at 2:1 = 33%; at 1:1 = 50% (before costs).

## Common mistakes (auditable)
- M1 No stop or moved stop farther (violates G4/G8).
- M2 Oversizing / risk > 1% (G2).
- M3 Revenge trading after loss / exceeding daily limit (G7).
- M4 Chasing: entry > 1 ATR above signal price.
- M5 Ignoring fees on small frequent trades (G6).
- M6 Averaging down losers in mean reversion.
- M7 Trading outside the universe / illiquid coins (G1).
- M8 Overfitting: changing rules after a few losses (require >= 30 trades before judging a strategy).

## Psychology
- Disposition effect: tendency to sell winners early and hold losers (Shefrin & Statman 1985). Counter: mechanical exits.
- Loss aversion (Kahneman & Tversky 1979): losses felt ~2x gains. Counter: think in R, pre-commit stops.
- Overtrading: active traders underperform (Barber & Odean 2000). Counter: trade only on signals; cap trades/week.
- FOMO / herding in crypto rallies; use checklists, not headlines.

## How to check each rule (journal coach audit)
1. Recompute indicators (SMA, ATR, RSI, Donchian, Bollinger) from the candle data at the entry timestamp; signal must be true.
2. Verify stop/target were logged before the entry timestamp.
3. Recompute size: |entry-stop| x qty <= 1% equity (+ costs). Position <= 25% equity; open risk <= 5%.
4. Planned R:R >= threshold after costs.
5. Exit matched the rule (stop, trail, SMA cross, time stop); flag discretionary exits.
6. Check stop history never moved against the trade.
7. Coin ranked top 20 at entry (CoinGecko/CoinMarketCap snapshot).
8. Score each trade: compliant / minor deviation / violation; report R-multiple and cumulative expectancy per strategy vs DCA benchmark.

## Sources
- Bitstamp BTC/USD daily OHLC via Sequoia (historian/2026-10-28-btc-2017-cycle.md, historian/2026-10-28-btc-2020-2021-cycle.md), used for the S1 history checks.
- Coinbase ETH/USD daily OHLC via Sequoia (historian/2026-10-28-eth-2016-2018-ico-cycle.md, historian/2026-10-28-eth-2020-2022-defi-merge-cycle.md), used for S1 tests 3 and 4.
- Bitstamp XRP/USD daily OHLC via Sequoia (historian/2026-10-28-xrp-2020-2023-sec-lawsuit-cycle.md), used for S1 test 5.
- Binance SOL/USDT daily OHLC via Sequoia (historian/2026-10-28-sol-2020-2023-ftx-cycle.md), used for S1 test 6.
- Binance DOGE/USDT daily OHLC via Sequoia (historian/2026-10-28-doge-2020-2022-meme-cycle.md), used for S1 test 7.
- Binance BNB/USDT daily OHLC via Sequoia (historian/2026-10-28-bnb-2020-2023-bsc-regulation-cycle.md), used for S1 test 8.
- Binance LINK/USDT daily OHLC via Sequoia (historian/2026-10-28-link-2019-2023-oracle-defi-cycle.md), used for S1 test 10.
- Binance AVAX/USDT daily OHLC via Sequoia (historian/2026-10-28-avax-2020-2023-rush-deloitte-tokenization-cycle.md), used for S1 test 11.
- Binance DOT/USDT daily OHLC via Sequoia (historian/2026-10-28-dot-2020-2023-parachain-auction-cycle.md), used for S1 test 12.
- Coinbase LTC-USD daily OHLC via Sequoia (historian/2026-10-28-ltc-2017-2019-segwit-halving-cycle.md), used for S1 test 13.
- Binance TRX/USDT daily OHLC via Sequoia (historian/raw-binance-trxusdt-daily-2018-2023.json), used for S1 test 15, S1-R7 and the S1-W1 update.
- Binance BTC/USDT daily OHLC via Sequoia (historian/raw-binance-btcusdt-daily-2023-2025.json), used for S1 test 16 and the BTC/ETH drawdown expectation.
- Bitfinex BCH/USD and BAB/USD (ABC chain) daily OHLC via Sequoia (historian/2026-10-28-bch-2017-2019-fork-hash-war-cycle.md), used for S1 test 14 and G12.
- GDAX ETH-USD trading update, 2017-06-22: https://medium.com/@AdamLWhite/eth-usd-trading-update-5d8142b5bdc1
- Moskowitz, Ooi, Pedersen (2012) Time Series Momentum, JFE: https://doi.org/10.1016/j.jfineco.2011.11.003
- Liu & Tsyvinski, Risks and Returns of Cryptocurrency (NBER w24877): https://www.nber.org/papers/w24877
- Liu, Tsyvinski, Wu, Common Risk Factors in Cryptocurrency (NBER w25882): https://www.nber.org/papers/w25882
- Hurst, Ooi, Pedersen, A Century of Evidence on Trend-Following (AQR): https://www.aqr.com/Insights/Research/Journal-Article/A-Century-of-Evidence-on-Trend-Following-Investing
- Barber & Odean (2000) Trading Is Hazardous to Your Wealth: https://doi.org/10.1111/0022-1082.00226
- Shefrin & Statman (1985) Disposition effect: https://doi.org/10.1111/j.1540-6261.1985.tb05002.x
- Kahneman & Tversky (1979) Prospect Theory: https://doi.org/10.2307/1914185
- Investopedia, Average True Range: https://www.investopedia.com/terms/a/atr.asp
- Investopedia, Dollar-cost averaging: https://www.investopedia.com/terms/d/dollarcostaveraging.asp
- Coinbase Advanced fees: https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees
- Binance fee schedule: https://www.binance.com/en/fee/schedule
