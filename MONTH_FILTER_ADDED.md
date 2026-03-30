# Month Filter Added to Maturity Profile

## Changes Made

### ✅ Added Month Filter
**Location**: Between Year and Sub Fund filters

**New Filter Layout**:
```
Year | Month | Sub Fund | Management Type | Asset Type | Number Scale
```

## Files Modified

### `frontend/components/MaturityProfile.tsx`

#### 1. Added Month State (Line 15)
```typescript
const [month, setMonth] = useState<number | 'all'>('all')
```

#### 2. Updated useEffect Dependency (Line 36)
```typescript
// Added 'month' to the dependency array
}, [viewMode, subFund, managementType, assetType, year, month])
```

#### 3. Updated fetchProfile Function (Lines 57-82)
```typescript
// Filter by year and month if selected
let profileData = data
if (year !== 'all' && data.data) {
  const yearStr = year.toString()
  profileData = {
    ...data,
    data: data.data.filter(item => {
      const matchesYear = item.period.startsWith(yearStr)
      if (month === 'all') return matchesYear
      // Filter by specific month (YYYY-MM format)
      const monthStr = month.toString().padStart(2, '0')
      return matchesYear && item.period.endsWith(`-${monthStr}`)
    })
  }
} else if (month !== 'all' && data.data) {
  // If only month is selected (no year), filter by month across all years
  const monthStr = month.toString().padStart(2, '0')
  profileData = {
    ...data,
    data: data.data.filter(item => item.period.endsWith(`-${monthStr}`))
  }
}
```

#### 4. Updated fetchCalendar Function (Lines 93-135)
```typescript
// Apply year and month filter
let startDate = year === 'all' ? undefined : `${year}-01-01`
let endDate = year === 'all' ? undefined : `${year}-12-31`

// If specific month is selected, adjust the date range
if (year !== 'all' && month !== 'all') {
  const monthStr = month.toString().padStart(2, '0')
  startDate = `${year}-${monthStr}-01`
  // Get last day of the month
  const lastDay = new Date(year, month, 0).getDate()
  endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
} else if (year === 'all' && month !== 'all') {
  // Client-side filtering for month when year is 'all'
  const monthStr = month.toString().padStart(2, '0')
  calendarData = calendarData.filter(item => 
    item.maturity_date.endsWith(`-${monthStr}`) || 
    item.maturity_date.split('-')[1] === monthStr
  )
}
```

#### 5. Added Month Filter UI (Lines 389-409)
```typescript
{/* Month */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
  <select
    value={month}
    onChange={(e) => setMonth(e.target.value as number | 'all')}
    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
  >
    <option value="all">All Months</option>
    <option value="1">January</option>
    <option value="2">February</option>
    <option value="3">March</option>
    <option value="4">April</option>
    <option value="5">May</option>
    <option value="6">June</option>
    <option value="7">July</option>
    <option value="8">August</option>
    <option value="9">September</option>
    <option value="10">October</option>
    <option value="11">November</option>
    <option value="12">December</option>
  </select>
</div>
```

## Filter Behavior

### Profile View
- **Year + Month**: Filters to specific month in that year (e.g., "March 2028")
- **Year Only**: Shows all months in that year (e.g., "2028" → Jan-Dec 2028)
- **Month Only**: Shows that month across all years (e.g., "March" → Mar 2026, Mar 2027, Mar 2028, etc.)
- **All Years + All Months**: No filtering, shows all data

### Calendar View
- **Year + Month**: Filters to specific date range (e.g., 01 Mar 2028 - 31 Mar 2028)
- **Year Only**: Shows all dates in that year (01 Jan - 31 Dec)
- **Month Only**: Shows that month across all years (client-side filtering)
- **All Years + All Months**: No filtering, shows all data

## Examples

### Example 1: Filter to March 2028
- **Year**: 2028
- **Month**: March
- **Result**: Shows only March 2028 data

### Example 2: Filter to All Marches
- **Year**: All Years
- **Month**: March
- **Result**: Shows March 2026, March 2027, March 2028, etc.

### Example 3: Filter to Year 2028
- **Year**: 2028
- **Month**: All Months
- **Result**: Shows Jan 2028 - Dec 2028

## Testing

1. **Open** http://localhost:3000
2. **Navigate** to "Maturity Profile" tab
3. **Verify** new Month filter appears between Year and Sub Fund
4. **Test** different combinations:
   - Year 2028 + Month March
   - All Years + Month March
   - Year 2028 + All Months
   - All Years + All Months

## Filter Layout

```
┌──────┬───────┬──────────┬─────────────────┬──────────────────────────┐
│ Year │ Month │ Sub Fund │ Management Type │ Asset Type │ Number Scale │
└──────┴───────┴───────────────────────────┴────────────┴──────────────┘
```

## Notes

- Month filter uses client-side filtering when "All Years" is selected
- When both Year and Month are selected, filtering is done server-side for better performance
- Month names are displayed in full (January, February, etc.) for clarity
- The filter works with both Profile View and Calendar View
