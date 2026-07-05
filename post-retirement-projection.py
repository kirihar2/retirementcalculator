#!/usr/bin/env python3
"""
Post-Retirement Portfolio Projection (Age 52-70+)
Bucket Strategy with Annual Transfers
"""

import math

# Initial portfolio at age 52 (8% return scenario, before inflation)
INITIAL_PORTFOLIO = 9130000  # ~$9.13M from earlier projection

# Bucket allocations at retirement
BUCKET_1_INITIAL = 915000     # 10% - Cash for year 1-2 spending + emergency
BUCKET_2_INITIAL = 1830000    # 20% - Bonds for years 3-5
BUCKET_3_INITIAL = 6385000    # 70% - Equities growth engine

# Parameters
RETIREMENT_AGE = 52
PLANNED_RETIREMENT_AGE = 70
SPENDING_ESSENTIAL = 90000    # Base essential spending (indexed for inflation)
SPENDING_TRAVEL_BASE = 100000  # Travel budget base amount
INFLATION_RATE = 0.025       # 2.5% annual inflation

# Returns
CASH_YIELD = 0.048           # 4.8% short-term rates
BOND_RETURN = 0.050          # 5.0% bond portfolio return (total, incl coupons)
EQUITY_SCENARIOS = [0.05, 0.06, 0.07, 0.08]  # Nominal equity returns

def calculate_real_spending(year):
    """Calculate annual spending target adjusted for inflation"""
    essential_adjusted = SPENDING_ESSENTIAL * (1 + INFLATION_RATE) ** year
    travel_adjusted = SPENDING_TRAVEL_BASE * (1 + INFLATION_RATE) ** year
    return essential_adjusted + travel_adjusted

def project_portfolio(returns):
    """Project portfolio through retirement using bucket strategy"""
    years = range(RETIREMENT_AGE, PLANNED_RETIREMENT_AGE + 1)

    results = {
        'B1': {'year': [], 'start': [], 'withdraw': [], 'yield': [], 'transfer_in': [],
                'transfer_out': [], 'end': []},
        'B2': {'year': [], 'start': [], 'withdraw': [], 'transfer_in': [], 'end': []},
        'B3': {'year': [], 'start': [], 'transfer_in': [], 'market_return': [], 'end': []}
    }

    print(f"{'Year':<6} | {'Bucket 1':<15} | {'B1 Yield':<12} | {'B1 Action':<15} | {'Bucket 2':<15} | {'Bucket 3':<15}")
    print("-" * 140)

    b1 = BUCKET_1_INITIAL
    b2 = BUCKET_2_INITIAL
    b3 = BUCKET_3_INITIAL

    ending_balance = 0

    for age in years:
        year_label = f"{age}"

        # Calculate spending for this year (inflation adjusted)
        spending = calculate_real_spending(age - RETIREMENT_AGE)

        # Bucket 1 operations
        b1_yield = b1 * CASH_YIELD

        # Withdraw from Bucket 1 if it has enough
        b1_withdraw = min(b1, spending)

        # Transfer remainder from B1 to B2 (this is the key bucket strategy flow)
        b1_remaining = b1 - b1_withdraw
        transfer_b1_to_b2 = b1_remaining

        # Bucket 1 ending balance (keep ~50k buffer in year 1, then deplete)
        if age == RETIREMENT_AGE:
            b1_end = max(50000, b1_remaining)  # Keep emergency buffer first year
        else:
            b1_end = b1_remaining

        # Bucket 2 operations - receive from B1, add own yield
        b2_yield = b2 * BOND_RETURN
        b2_start_with_transfer = b2 + transfer_b1_to_b2 + b2_yield
        b2_withdraw = min(b2_start_with_transfer, spending * 0.3)  # Bonds cover ~30% of spending

        # Transfer from B2 to B3 once covered period ends
        if age >= RETIREMENT_AGE + 4:  # After year 5
            transfer_b2_to_b3 = b2_start_with_transfer - b2_withdraw
            b2_end = max(10000, transfer_b2_to_b3 * 0.9)  # Keep some buffer
        else:
            transfer_b2_to_b3 = 0
            b2_end = b2_start_with_transfer - b2_withdraw

        # Bucket 3 operations - growth engine
        equity_return = returns[age - RETIREMENT_AGE] if age < len(returns) else EQUITY_SCENARIOS[-1]
        dividends_b3 = b3 * 0.015  # ~1.5% dividend yield (VOO ~1.4%, VOOG ~2%)
        market_gain = (b3 + dividends_b3) * equity_return - (b3 + dividends_b3)
        transfer_b3_growth = min(100000, b3 * 0.08)  # Transfer up to 8% annually for safety

        # Withdrawal from B3 for remaining expenses not covered by other buckets
        spending_covered_by_others = b1_withdraw + b2_withdraw
        b3_withdraw = max(0, spending - spending_covered_by_others)

        b3_end = (b3 + dividends_b3 + transfer_b3_growth) - b3_withdraw

        # Store results
        results['B1']['year'].append(year_label)
        format_b1_start = f"{b1:.2f}"
        results['B1']['start'].append(format_b1_start)
        results['B1']['yield'].append(b1_yield)
        results['B1']['withdraw'].append(b1_withdraw)
        results['B1']['transfer_out'].append(transfer_b1_to_b2)
        results['B1']['end'].append(b1_end)

        results['B2']['year'].append(year_label)
        format_b2_start = f"{b2:.2f}"
        results['B2']['start'].append(format_b2_start)
        results['B2']['withdraw'].append(b2_withdraw)
        results['B2']['transfer_in'].append(transfer_b1_to_b2)
        results['B2']['end'].append(b2_end)

        results['B3']['year'].append(year_label)
        format_b3_start = f"{b3:.2f}"
        results['B3']['start'].append(format_b3_start)
        results['B3']['transfer_in'].append(0)
        results['B3']['market_return'].append(equity_return * 100)
        results['B3']['end'].append(b3_end)

        print(f"{year_label:<6} | ${b1_end:,.0f:>13} | ${b1_yield:0.0f:>12} | W:{b1_withdraw:0.0f:>5} T+{transfer_b1_to_b2:0.0f:>9} | "
              f"${b2_end:,.0f:>14} | B3: ${b3_end:,.0f:>13} ({equity_return*100:5.1f}% ret)")

        # Update balances for next year
        b1 = b1_end
        b2 = b2_end
        b3 = b3_end

        ending_balance = b1 + b2 + b3

    print(f"\n{'Ending portfolio at age 70:':<40} ${ending_balance:>13,.2f}")

    return results, ending_balance

if __name__ == "__main__":
    # Generate simple return projections for each year (could be more sophisticated)
    # Age 52-69 (18 years) with declining equity expectations as we approach retirement
    returns_by_age = {
        52: 0.08,  53: 0.07,  54: 0.07,  55: 0.06,  56: 0.06,
        57: 0.06,  58: 0.05,  59: 0.05,  60: 0.05,  61: 0.05,
        62: 0.04,  63: 0.04,  64: 0.04,  65: 0.04,  66: 0.04,
        67: 0.03,  68: 0.03,  69: 0.03
    }

    project_portfolio([returns_by_age.get(a) for a in range(52, 70)])
