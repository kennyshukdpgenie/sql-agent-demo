import requests
import json

# Webhook URL
url = "http://localhost:5277/webhook-test/abi-test"

# Input text in Chinese
input_text = "最近一个月在广东ABI的销量总量是多少？"

# Prepare the data payload (we found this is the correct format)
data = {
    "text": input_text
}

print(f"🚀 Sending request to: {url}")
print(f"📝 Question: {input_text}")
print("-" * 50)

try:
    # Send POST request with JSON data
    response = requests.post(
        url,
        json=data,
        headers={
            "Content-Type": "application/json"
        }
    )
    
    # Print response details
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Raw Response Body: {repr(response.text)}")
    print("-" * 50)
    
    # Check if response is successful
    if response.status_code == 200:
        if response.text.strip():
            try:
                json_response = response.json()
                print("✅ Successfully received JSON response:")
                print(json.dumps(json_response, indent=2, ensure_ascii=False))
                
                # Try to extract the result if it's in the expected format
                if isinstance(json_response, dict) and "result" in json_response:
                    print(f"\n🎯 Answer: {json_response['result']}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON Parse Error: {e}")
                print("Response is not valid JSON:")
                print(response.text)
        else:
            print("⚠️ Empty response - Make sure to:")
            print("1. Click 'Test workflow' button in n8n")
            print("2. Run this script immediately after")
            print("3. The webhook only works for one call in test mode")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection Error: Unable to connect to {url}")
    print(f"Make sure your n8n server is running on port 5277")
    print(f"Error details: {e}")
except requests.exceptions.RequestException as e:
    print(f"❌ Request Error: {e}")
except Exception as e:
    print(f"❌ Unexpected Error: {e}")

print("\n💡 Remember: In n8n test mode, click 'Test workflow' before each request!") 