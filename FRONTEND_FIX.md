# Maturity Profile View Fix

## Issues Fixed

### 1. Profile View Showing Blank with NaN
**Problem**: The Profile View was displaying "IDR NaN" and the chart was blank.

**Root Cause**: 
- The backend returns decimal values as strings (e.g., `"123.45"`) but the frontend was treating them as numbers
- The `formatCurrency()` and calculations were receiving string values, causing NaN errors

**Solution**:
- Added `Number()` conversion for all monetary values before formatting
- Updated `BarChart` component to properly convert string decimals to numbers
- Fixed Total Principal display to handle string-to-number conversion

### 2. Group By Filter Not Working
**Problem**: The "Group By" (Monthly/Yearly) filter was not functioning correctly.

**Root Cause**:
- The frontend was trying to transform calendar data manually instead of using the backend's `/profile` endpoint
- Reference to undefined `groupBy` variable in the BarChart component

**Solution**:
- Removed the "Group By" filter from the UI as requested
- Updated `fetchProfile()` to use the `/api/portfolio/profile` endpoint directly
- The backend already handles grouping by month efficiently
- Year filtering is done client-side by filtering the returned periods

## Files Modified

### `frontend/components/MaturityProfile.tsx`

1. **Removed GroupBy type and state** (Line 7-8):
```typescript
// Removed:
type GroupBy = 'month' | 'year'
const [groupBy, setGroupBy] = useState<GroupBy>('month')
```

2. **Updated useEffect dependency** (Line 32):
```typescript
// Before:
}, [viewMode, groupBy, subFund, managementType, assetType, year])

// After:
}, [viewMode, subFund, managementType, assetType, year])
```

3. **Simplified fetchProfile function** (Lines 46-67):
```typescript
const fetchProfile = async () => {
  setLoading(true)
  setError(null)
  try {
    // Use the profile endpoint directly with proper filters
    const data = await getMaturityProfile(
      subFund || undefined,
      managementType || undefined,
      assetType || undefined,
      'month' // Always group by month
    )
    console.log('Profile data:', data)

    // Filter by year if selected
    let profileData = data
    if (year !== 'all' && data.data) {
      const yearStr = year.toString()
      profileData = {
        ...data,
        data: data.data.filter(item => item.period.startsWith(yearStr))
      }
    }

    setProfileData(profileData)
  } catch (err: any) {
    console.error('Profile error:', err)
    setError(err.response?.data?.detail || 'Failed to fetch maturity profile')
  } finally {
    setLoading(false)
  }
}
```

4. **Fixed BarChart component** (Lines 158-220):
```typescript
const BarChart = ({ data }: { data: MaturityProfileSummary }) => {
  // ... empty state check ...

  // Convert string decimals to numbers
  const maxValue = Math.max(...data.data.map(d => Number(d.total_amount) || 0), 1)
  
  // ... in the map function ...
  const totalAmount = Number(item.total_amount) || 0
  const maturityAmount = Number(item.maturity_amount) || 0
  const couponAmount = Number(item.coupon_amount) || 0
  
  // Fixed period display (remove groupBy reference)
  {item.period.length === 7 ? item.period.substring(5) : item.period}
}
```

5. **Fixed Total Principal display** (Line 440):
```typescript
<p className="text-3xl font-bold text-primary-600">
  {formatCurrency(Number(profileData.total_principal) || 0)}
</p>
```

6. **Fixed Calendar View table** (Lines 497-504):
```typescript
<td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
  {formatNumber(Number(item.principal_amount) || 0)}
</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
  {formatNumber(Number(item.coupon_amount) || 0)}
</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-primary-600">
  {formatNumber(Number(item.total_amount) || 0)}
</td>
```

7. **Removed Group By filter UI** (Lines 368-378):
```typescript
// Removed the entire "Group By" filter section
```

## Testing

### API Test
```bash
cd backend
venv\Scripts\python.exe -c "import requests; r = requests.get('http://localhost:8000/api/portfolio/profile'); print(r.json())"
```

Expected output: 145 periods of data from 2026-02 to 2041-10

### Frontend Test
1. Open http://localhost:3000
2. Navigate to "Maturity Profile" tab
3. Verify Profile View shows:
   - Total Principal: IDR 2,412,422,278,949.00 (or filtered amount)
   - Bar chart with monthly data
   - Blue bars (Maturity) and Green bars (Coupon)
4. Verify Calendar View shows:
   - Table with all maturity data
   - Proper number formatting
5. Test filters:
   - Year filter (All Years, 2026, 2027, etc.)
   - Sub Fund (OPEX, CAPEX)
   - Management Type (All, Syariah, Conventional)
   - Asset Type (All, Deposito, Bond, Bond Coupon)

## Result

✅ Profile View now displays correctly with proper number formatting
✅ Chart shows monthly maturity data with blue (principal) and green (coupon) bars
✅ Total Principal displays correct value instead of NaN
✅ Calendar View shows all data with proper formatting
✅ Year filter works by filtering periods client-side
✅ Removed non-functional "Group By" filter

## Notes

- The backend `/api/portfolio/profile` endpoint returns data grouped by month in the format `YYYY-MM`
- Decimal values from the backend are returned as strings and need to be converted to numbers in the frontend
- The "Group By" feature was removed as it wasn't working and the backend already provides optimal monthly grouping
- Year filtering is now done client-side by filtering the `period` field
