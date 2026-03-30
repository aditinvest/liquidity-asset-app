# Maturity Profile UI Improvements

## Changes Made

### 1. ✅ Number Scale Filter Moved
**Location**: Moved to be beside Asset Type filter

**Before**: Number Scale was on a separate row with `md:col-span-3`
**After**: Number Scale is now in the same row as Asset Type, with standard column width

**Layout**:
```
Year | Sub Fund | Management Type | Asset Type | Number Scale
```

### 2. ✅ Month Name Display
**Changed**: Period display now shows month names instead of numbers

**Examples**:
- `2026-03` → "Mar 2026" (Profile View chart)
- `2026-03-15` → "15 Mar 2026" (Calendar View table)

## Files Modified

### `frontend/components/MaturityProfile.tsx`

#### 1. Added formatPeriod function (Line 158-169)
```typescript
// Format period to display month name (e.g., "2026-03" -> "Mar 2026")
const formatPeriod = (period: string) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  if (period.length === 7) {
    // Format: YYYY-MM
    const [year, month] = period.split('-')
    const monthIndex = parseInt(month, 10) - 1
    return `${monthNames[monthIndex]} ${year}`
  }
  // Format: YYYY (yearly)
  return period
}
```

#### 2. Added formatDate function (Line 172-177)
```typescript
// Format date for calendar view (e.g., "2026-03-15" -> "15 Mar 2026")
const formatDate = (dateString: string) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [year, month, day] = dateString.split('-')
  const monthIndex = parseInt(month, 10) - 1
  return `${day} ${monthNames[monthIndex]} ${year}`
}
```

#### 3. Updated BarChart period display (Line 231)
```typescript
// Before:
{item.period.length === 7 ? item.period.substring(5) : item.period}

// After:
{formatPeriod(item.period)}
```

#### 4. Updated Calendar View date display (Line 493)
```typescript
// Before:
<td>{item.maturity_date}</td>

// After:
<td>{formatDate(item.maturity_date)}</td>
```

#### 5. Moved Number Scale filter (Lines 379-389)
```typescript
// Before:
<div className="md:col-span-3">
  <label>Number Scale</label>
  <select>...</select>
</div>

// After:
<div>
  <label>Number Scale</label>
  <select>...</select>
</div>
```

## Visual Changes

### Filter Layout
```
┌─────────┬──────────┬─────────────────┬────────────┬──────────────┐
│  Year   │ Sub Fund │ Management Type │ Asset Type │ Number Scale │
└─────────┴──────────┴─────────────────┴────────────┴──────────────┘
```

### Profile View Chart
```
Before:  03 2026  →  After:  Mar 2026
Before:  04 2026  →  After:  Apr 2026
Before:  05 2026  →  After:  May 2026
```

### Calendar View Table
```
Before:  2026-03-15  →  After:  15 Mar 2026
Before:  2026-04-20  →  After:  20 Apr 2026
Before:  2026-05-25  →  After:  25 May 2026
```

## Testing

1. **Open** http://localhost:3000
2. **Navigate** to "Maturity Profile" tab
3. **Verify** filter layout:
   - All 5 filters in one row
   - Number Scale next to Asset Type
4. **Verify** Profile View:
   - Chart x-axis shows "Mar 2026", "Apr 2026", etc.
5. **Verify** Calendar View:
   - Date column shows "15 Mar 2026", "20 Apr 2026", etc.

## Month Names Reference

| Number | Name |
|--------|------|
| 01     | Jan  |
| 02     | Feb  |
| 03     | Mar  |
| 04     | Apr  |
| 05     | May  |
| 06     | Jun  |
| 07     | Jul  |
| 08     | Aug  |
| 09     | Sep  |
| 10     | Oct  |
| 11     | Nov  |
| 12     | Dec  |

## Notes

- The frontend should auto-reload with these changes
- If changes don't appear, refresh the browser with `Ctrl+Shift+R`
- Month names are abbreviated to 3 characters for better readability
- The format functions handle both monthly (YYYY-MM) and yearly (YYYY) periods
