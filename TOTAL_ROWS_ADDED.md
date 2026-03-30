# Total Rows Added to Maturity Profile

## Changes Made

### ✅ Added Total Rows
Added total summary rows that show the sum of Principal, Coupon, and Total amounts for the currently filtered data.

**Locations**:
1. **Profile View**: Summary table below the chart with totals
2. **Calendar View**: Total row at the bottom of the table

## Files Modified

### `frontend/components/MaturityProfile.tsx`

#### 1. Profile View - Summary Table (Lines 531-576)
Added a new summary table below the bar chart showing all periods with totals:

```typescript
{/* Summary Table */}
<div className="mt-8">
  <h4 className="text-md font-semibold text-gray-900 mb-4">Summary by Period</h4>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th>Period</th>
          <th>Principal</th>
          <th>Coupon</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {profileData.data.map((item, index) => (
          <tr key={index}>
            <td>{formatPeriod(item.period)}</td>
            <td>{formatNumber(Number(item.maturity_amount) || 0)}</td>
            <td>{formatNumber(Number(item.coupon_amount) || 0)}</td>
            <td>{formatNumber(Number(item.total_amount) || 0)}</td>
          </tr>
        ))}
        {/* Total Row */}
        <tr className="bg-gray-100 font-bold">
          <td>Total</td>
          <td>{formatNumber(profileData.data.reduce((sum, item) => sum + (Number(item.maturity_amount) || 0), 0))}</td>
          <td>{formatNumber(profileData.data.reduce((sum, item) => sum + (Number(item.coupon_amount) || 0), 0))}</td>
          <td>{formatNumber(profileData.data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0))}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

#### 2. Calendar View - Total Row (Lines 607-620)
Added a total row at the bottom of the calendar table:

```typescript
{/* Total Row */}
<tr className="bg-gray-100 font-bold">
  <td>Total</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td>
    {formatNumber(calendarData.reduce((sum, item) => sum + (Number(item.principal_amount) || 0), 0))}
  </td>
  <td>
    {formatNumber(calendarData.reduce((sum, item) => sum + (Number(item.coupon_amount) || 0), 0))}
  </td>
  <td>
    {formatNumber(calendarData.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0))}
  </td>
</tr>
```

## Features

### Dynamic Totals
The totals update automatically based on the applied filters:
- **Year Filter**: Totals show sum for selected year only
- **Month Filter**: Totals show sum for selected month only
- **Year + Month**: Totals show sum for specific month in that year
- **Sub Fund Filter**: Totals reflect OPEX or CAPEX only
- **Management Type Filter**: Totals reflect Syariah or Conventional only
- **Asset Type Filter**: Totals reflect selected asset type only

### Visual Styling
- **Total Row Background**: Gray (`bg-gray-100`)
- **Total Row Font**: Bold (`font-bold`)
- **Total Column Alignment**: Right-aligned for numerical data
- **Total Amount Color**: Primary blue for the final total column

## Examples

### Example 1: All Data
**Filters**: All Years, All Months, All Sub Funds, All Types
```
Profile View Summary:
┌───────────┬─────────────┬────────────┬──────────────┐
│  Period   │  Principal  │   Coupon   │    Total     │
├───────────┼─────────────┼────────────┼──────────────┤
│ Mar 2026  │   356.7 B   │   10.1 B   │   366.8 B    │
│ Apr 2026  │   128.2 B   │   18.2 B   │   146.4 B    │
│ ...       │   ...       │   ...      │   ...        │
├───────────┼─────────────┼────────────┼──────────────┤
│ Total     │ 2,412.4 B   │  55.2 B    │ 2,467.6 B    │
└───────────┴─────────────┴────────────┴──────────────┘
```

### Example 2: Filtered to 2028
**Filters**: Year 2028, All Months
```
Profile View Summary:
┌───────────┬─────────────┬────────────┬──────────────┐
│  Period   │  Principal  │   Coupon   │    Total     │
├───────────┼─────────────┼────────────┼──────────────┤
│ Jan 2028  │     0       │    2.5 B   │     2.5 B    │
│ Feb 2028  │    60.0 B   │   11.3 B   │    71.3 B    │
│ Mar 2028  │    35.0 B   │    7.5 B   │    42.5 B    │
│ ...       │   ...       │   ...      │   ...        │
├───────────┼─────────────┼────────────┼──────────────┤
│ Total     │   375.4 B   │   67.8 B   │   443.2 B    │
└───────────┴─────────────┴────────────┴──────────────┘
```

### Example 3: Calendar View with Filters
**Filters**: Year 2026, Month March, Sub Fund OPEX
```
Calendar View:
┌─────────────┬──────────┬────────────┬──────────┬──────────┬───────────┬─────────┬──────────┐
│    Date     │ Sub Fund │  Mgmt Type │   Type   │ Security │ Principal │ Coupon  │  Total   │
├─────────────┼──────────┼────────────┼──────────┼──────────┼───────────┼─────────┼──────────┤
│ 11 Mar 2026 │  OPEX    │ Konvensional│ Deposito │ BANK DKI │  50.0 B   │    0    │  50.0 B  │
│ 15 Mar 2026 │  OPEX    │ Syariah   │   Bond   │  FR0080  │     0     │  0.84 B │   0.84 B │
│ ...         │  ...     │   ...     │   ...    │   ...    │   ...     │   ...   │   ...    │
├─────────────┼──────────┼────────────┼──────────┼──────────┼───────────┼─────────┼──────────┤
│ Total       │          │            │          │          │ 356.7 B   │ 10.1 B  │ 366.8 B  │
└─────────────┴──────────┴────────────┴──────────┴──────────┴───────────┴─────────┴──────────┘
```

## Testing

1. **Open** http://localhost:3000
2. **Navigate** to "Maturity Profile" tab
3. **Profile View**:
   - Verify summary table appears below the chart
   - Check that totals update when changing filters
   - Verify total row has gray background and bold text
4. **Calendar View**:
   - Verify total row appears at bottom of table
   - Check that totals update when changing filters
   - Verify totals match the filtered data

## Notes

- Totals are calculated client-side using `reduce()` function
- All monetary values are converted to numbers before summing
- Empty/invalid values are treated as 0
- Number formatting respects the selected Number Scale filter
- Total row is visually distinct with gray background and bold text
