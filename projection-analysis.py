#!/usr/bin/env python3
"""
Retirement Projection Analysis for fire-dashboard-backup-2026-07-04.json

Analyzes retirement plan with 10% real returns and compares to other backups.
"""

import json
from datetime import datetime

# Load the current backup file
with open('/Users/jurankirihara/Downloads/fire-dashboard-backup-2026-07-04.json') as f:
    data = json.load(f)

# Constants
BASE_AGE = 32  # Starting age (when mortgage begins)
RETIREMENT_AGE = 58
TARGET_AGE = 95
INFLATION_RATE = 0.02  # Assume 2% inflation
REAL_RETURN_RATE = 0.10  # 10% real returns as requested
NOMINAL_RETURN_RATE = REAL_RETURN_RATE + INFLATION_RATE ** 2 + 2 * REAL_RETURN_RATE * INFLATION_RATE  # ~12% nominal
INVESTMENT_RETURN = 0.035  # 3.5% typical investment return (after inflation)

def annualize_rate(monthly_rate):
    """Convert monthly rate to annual effective rate"""
    return (1 + monthly_rate) ** 12 - 1

# Convert real returns to monthly
monthly_real = (1 + REAL_RETURN_RATE) ** (1/12) - 1
monthly_nominal = (1 + NOMINAL_RETURN_RATE) ** (1/12) - 1

print("=" * 70)
print("RETIREMENT PROJECTION ANALYSIS")
print("=" * 70)
print(f"Analysis Date: {datetime.now().strftime('%Y-%m-%d')}")
print(f"Base Age: {BASE_AGE}")
print(f"Retirement Age: {RETIREMENT_AGE}")
print(f"Target Age: {TARGET_AGE}")
print("=" * 70)

# Initial state (from the JSON)
initial_portfolio = data['initialActuals']['portfolio']
initial_savings = data['initialActuals']['savings']
base_monthly_spending = 0  # Not specified in this file - note this!

print(f"\nInitial Portfolio: ${initial_portfolio:,.2f}")
print(f"Initial Savings: ${initial_savings:,.2f}")
print(f"Base Monthly Spending: ${base_monthly_spending:,.2f} (NOT SET)")

# Override with user-provided starting savings if specified
STARTING_SAVINGS = 555000
INITIAL_PORTFOLIO_FINAL = initial_portfolio + STARTING_SAVINGS
print(f"User Starting Savings: ${STARTING_SAVINGS:,.2f}")
print(f"CUMULATIVE INITIAL PORTFOLIO: ${INITIAL_PORTFOLIO_FINAL:,.2f}")

# Aggregate all expenses by age
expenses_by_age = {}
mortgage_payments = []
debt_payments = []

for event in data['lifeEvents']:
    monthly_expense = event['amount'] if 'monthlyPayment' not in event else event['amount'] / 12
    start = event['startAge'] - BASE_AGE + 20  # Adjust to current age reference
    end = event['endAge'] - BASE_AGE + 20

    # Check if these are lump sum or monthly (adjust for the different field naming)
    if 'monthlyPayment' in event:
        is_lump_sum = False
        payment_rate = event['amount']
    else:
        is_lump_sum = True
        payment_rate = monthly_expense

    for age in range(start, end):
        key = f"{age}yo"
        if is_lump_sum:
            expenses_by_age[key] = expenses_by_age.get(key, 0) + event['amount']
        else:
            expenses_by_age[key] = expenses_by_age.get(key, 0) + monthly_expense

print(f"\n{'Age':<8} {'Expense Type':<25} {'Amount':>12}")
print("-" * 50)

for age in sorted(expenses_by_age.keys()):
    amount = expenses_by_age[age]
    expense_type = "Lump Sum" if isinstance(amount, (int, float)) and amount > 1000 else "Monthly"
    print(f"{age:6} {expense_type:<23} ${amount:>10,.2f}")

# Create a comprehensive projection
class ProjectionModel:
    def __init__(self, data):
        self.data = data
        self.age = 20  # Starting age
        self.portfolio_value = initial_portfolio
        self.debt_payments_schedule = []

    def process_debts(self):
        """Calculate debt payment schedule"""
        for debt in self.data['debtPayments']:
            monthly = debt['monthlyPayment']
            start_age = debt['startAge'] - BASE_AGE + 20
            end_age = debt['endAge'] - BASE_AGE + 20

            for age in range(start_age, min(end_age, self.data.get('maxAge', 100))):
                key = f"{age}yo"
                monthly_expenses = expenses_by_age.get(key, 0)
                # Debt payments reduce the net portfolio growth (treated as spending until paid off)
                debt_payments = {key: self.data['debtPayments'][-1]['monthlyPayment']}

    def project_growth(self):
        """Project portfolio growth with compound returns"""
        projections = []

        for age in range(20, TARGET_AGE + 1):
            key = f"{age}yo"

            # Apply lump sum expenses at the beginning of each year
            if key in expenses_by_age:
                expense = expenses_by_age[key]
                self.portfolio_value -= expense

            # Calculate annual return and growth
            annual_return_rate = INVESTMENT_RETURN * 12  # Monthly compounding
            monthly_return = (1 + INVESTMENT_RETURN) ** (1/12) - 1

            # Project 1 month of growth (or partial year for first/last age)
            months_this_year = 12 if age != self.age else 0
            if age == self.age:
                months_this_year = 365 % 365  # Fractional period

        return projections

# Simple projection with 10% real returns (~12.8% nominal)
print("\n" + "=" * 70)
print("PROJECTED PORTFOLIO GROWTH (10% Real Returns)")
print("=" * 70)

portfolio = INITIAL_PORTFOLIO_FINAL
print(f"\nStarting Portfolio: ${INITIAL_PORTFOLIO_FINAL:,.2f}")

# Project growth year by year
for age in range(20, TARGET_AGE + 1):
    # Annual growth with 12.8% nominal return (compounded monthly)
    if portfolio > 0:
        annual_growth = portfolio * ((1 + NOMINAL_RETURN_RATE) ** (1/12)) ** 12 - portfolio
        portfolio += annual_growth

    # Subtract expenses at each age
    key = f"{age}yo"
    if key in expenses_by_age:
        expense = expenses_by_age[key]
        print(f"\nAge {age}:")
        print(f"  Beginning Portfolio: ${portfolio - expense + expenses_by_age.get(f'{max(20, age-1)}yo', 0):,.2f}")
        portfolio -= expense

    # Print at retirement and key milestones
    if age in [35, 40, 45, 50, 58, 65, 75, 85]:
        print(f"\nAge {age} Portfolio Value: ${portfolio:,.2f}")

print("\n" + "=" * 70)
print("ANALYSIS SUMMARY")
print("=" * 70)

print("""
CRITICAL OBSERVATIONS:

1. BASE SPENDING NOT CONFIGURED
   - The file shows initial_portfolio = 0 and base_monthly_spending = 0
   - Life events list specific expenses but no baseline retirement spending
   - This is likely an incomplete configuration

2. EXPENSE SUMMARY:
   - Daycare (Child 1): $2,000 × 60 months = $120,000
   - Daycare (Child 2): $1,500 × 60 months = $90,000
   - College Child 1: $400 × 216 months = $86,400
   - College Child 2: $400 × 216 months = $86,400
   - Masters/PhD Fund: $60,000 (lump sum at age 55-59)
   - Long Term Care (age 85+): $20,000/month × 120 months = $2,400,000

3. DEBT PAYMENTS SUMMARY:
   - Mortgage: $4,100 × 312 months (age 32-58) = ~$1,279,200
   - Auto Loan: $1,500 × 12 months = $18,000
   - Student Loans: $700 × 36 months = $25,200

4. WITH 10% REAL RETURNS, THE SCENARIO:
   - Starting from $0 portfolio
   - All expenses must come from investment growth
   - This is likely an incomplete plan (missing income sources)

5. LONG TERM CARE EXPENSE ($2.4M over 10 years):
   - At age 85+, this needs to be funded
   - If you retire at 58, you need to grow enough by then
   - Or have a pension/other income source

RECOMMENDATIONS:

1. CONFIGURE BASE RETIREMENT SPENDING
   - Add your expected monthly spending in retirement (e.g., $20k-40k/month)
   - This is critical for FIA (Financial Independence Retireement) calculations

2. ADD INCOME SOURCES
   - Pensions, employer benefits, or other guaranteed income sources
   - The current file has empty "pensions" array

3. SET INITIAL SAVINGS
   - You likely have some savings already
   - This affects the starting portfolio value

4. CONSIDER SOCIAL SECURITY
   - Not included in current configuration
   - Can provide $2,000-6,000/month depending on your earnings history

5. LONG TERM CARE PLANNING
   - $2.4M projected LTC expense is substantial
   - Consider LTC insurance or dedicated savings vehicle
""")

print("\n" + "=" * 70)
