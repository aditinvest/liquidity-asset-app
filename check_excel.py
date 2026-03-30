import pandas as pd

# Read Excel file
file_path = 'Data Portfolio Asset BP 27022026.xlsx'
xls = pd.ExcelFile(file_path)

print("Sheet names:", xls.sheet_names)
print("\n" + "="*50 + "\n")

for sheet_name in xls.sheet_names:
    print(f"Sheet: {sheet_name}")
    df = pd.read_excel(xls, sheet_name=sheet_name)
    print(f"Columns: {list(df.columns)}")
    print(f"Shape: {df.shape}")
    print(f"\nFirst 3 rows:")
    print(df.head(3))
    print("\n" + "="*50 + "\n")
