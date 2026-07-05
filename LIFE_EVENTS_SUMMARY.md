# Life Events UI - Summary

## What Was Added

I've connected the **LifeEventsSection** component to your InputPanel so you can now edit life events like daycare and college savings directly in the UI.

## How to Use Life Events Editing

### Find the Life Events Section

Scroll down the left sidebar to see a new section called **"Life Events"** with two cards:

1. **Daycare (First Child)** - Limited expense ($2,000/month from age 34-39)
2. **College savings 1** - Limited expense ($400/month from age 34-52)

### Edit an Event

Click on any field to edit it:

- **Name**: Rename the event (e.g., "Daycare (First Child)")
- **Type**: Select frequency:
  - `Monthly` - Repeats every month forever until death/age limit
  - `One-Time` - Happens once at a specific age
  - `Limited` - Occurs for a period of time (startAge to endAge)
- **Amount**: Enter the amount in dollars
- **Start Age**: When this expense begins
- **End Age** (if Limited): When it stops
- **Description**: Notes about the event

### Add New Events

Click **"+ Add Event"** button:
- Default creates a "Limited" type event starting at your current age
- Example: Wedding costs, grandkids' expenses, etc.

### Remove Events

Click the **X** button on any card to delete that event.

## What Happens When You Edit

Your changes immediately recalculate your FIRE projection:

- **Daycare example**: If you reduce daycare from $2,000/month to $1,500/month, your savings will be higher by ($500 × 12 = $6,000) per year during years 34-39
- **Adding college expenses**: Adding a new college saving event reduces your portfolio during that period
- These costs affect your projected retirement age and fire target amount

## Current Default Events (Editable)

The system includes two default life events:

1. **Daycare (First Child)**
   - Type: Limited (34-39 years old)
   - Amount: $2,000/month
   - Description: "Monthly expense for first child childcare"

2. **College savings 1**
   - Type: Limited (34-52 years old)
   - Amount: $400/month
   - Description: "Monthly expense for first child college"

You can rename these, change the amounts, or add more events like wedding costs, grandkids' childcare, etc.
