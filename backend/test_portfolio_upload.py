import requests
import time

# Wait a bit for server to be ready
time.sleep(2)

# Test upload portfolio
upload_url = "http://localhost:8000/api/portfolio/upload"
file_path = "../Data Portfolio Asset BP 27022026.xlsx"

print("Testing portfolio upload...")
print(f"File: {file_path}")

try:
    with open(file_path, "rb") as f:
        files = {"file": f}
        params = {"clear_previous": True}
        
        response = requests.post(upload_url, files=files, params=params)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("\n✅ Upload successful!")
        else:
            print(f"\n❌ Upload failed: {response.json().get('detail', 'Unknown error')}")
            
except Exception as e:
    print(f"\n❌ Error: {e}")

# Test get portfolio summary
print("\n" + "="*50)
print("Testing portfolio summary...")
summary_url = "http://localhost:8000/api/portfolio/summary"

try:
    response = requests.get(summary_url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test get maturity calendar
print("\n" + "="*50)
print("Testing maturity calendar...")
calendar_url = "http://localhost:8000/api/portfolio/calendar"

try:
    response = requests.get(calendar_url)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Total items: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"First item: {result['data'][0]}")
except Exception as e:
    print(f"Error: {e}")

print("\n✅ Test completed!")
