import pandas as pd

# Read the Excel file
excel_path = r"E:\Backup C\Development Apps\liquidity -aset-app 2\Data CF Projection Asset BP 27022026.xlsx"
sheet_name = "Depo"

# Read the Depo sheet
df = pd.read_excel(excel_path, sheet_name=sheet_name)

print("=== All Columns in Depo Sheet ===")
print(df.columns.tolist())
print()

# Filter: FundID = "OPEX" AND Syariah = "No" (Conventional)
filtered_df = df[(df["FundID"] == "OPEX") & (df["Syariah"] == "No")]

# Select specific columns
columns_to_show = ["FundID", "CounterpartID", "CounterpartName", "MaturityDate", "DepositAmount", "Syariah"]
result = filtered_df[columns_to_show]

print("=== OPEX Conventional Deposito Entries ===")
print(result.to_string(index=False))
print()

# Calculate total DepositAmount grouped by MaturityDate
grouped = filtered_df.groupby("MaturityDate")["DepositAmount"].sum().reset_index()
grouped.columns = ["MaturityDate", "TotalDepositAmount"]

print("=== Total DepositAmount by MaturityDate ===")
print(grouped.to_string(index=False))
print()

print(f"=== Summary ===")
print(f"Total OPEX Conventional entries: {len(filtered_df)}")
print(f"Grand Total DepositAmount: {filtered_df['DepositAmount'].sum():,.2f}")
