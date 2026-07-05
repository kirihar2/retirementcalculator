# Life Events Spending Column - Summary

## What Was Added

I've added a new **"Life Events Spending"** column to your projection table that aggregates and displays the spending from your life events (daycare, college savings, etc.) each year.

## How It Works

### The Column Shows:

- **Age**: Displays every 5 years as before
- **Life Events Spending**: Shows the aggregated monthly expenses from all active life events for that age range

### Example Output:

Looking at your current default setup, you'll see:

| Age | Life Events Spending |
|-----|---------------------|
| 30 | $0 (no life events active) |
| 35 | ~$24,000 (daycare for first child + college savings) |
| 40 | ~$18,000 (daycare + college ending) |

### How Aggregation Works:

1. **Monthly/Limited Events**: Multiplied by 12 to get annual cost
2. **One-Time Events**: Added only in the year they occur
3. **Grouped by Age Range**: Expenses are shown for ages when events are active
4. **Zero When Inactive**: Shows $0 if no life events are active that age

## Where to See It

1. Switch to **"Annual Projection"** view (click the dropdown next to your portfolio chart)
2. Select **"Table View"** or **"Both"**
3. Scroll down in the projection table - you'll see the new "Life Events Spending" column

## Benefits

- **See Hidden Costs**: Easily identify years where life event expenses reduce your savings
- **Plan Ahead**: Know exactly how much daycare/college will cost before those events start
- **Adjust & Compare**: Try different daycare costs or college timelines and see the impact

## Customizing Life Events

You can edit the life events in the left sidebar:

1. Scroll to **"Life Events"** section
2. Edit any field (name, type, amount, start/end age)
3. See immediate updates to the projection table

**Examples:**
- Reduce daycare from $2,000→$1,500/month → saves $6,000/year in that period
- Add wedding costs as a one-time event at age 30
- Add grandkids' childcare starting at age 60
