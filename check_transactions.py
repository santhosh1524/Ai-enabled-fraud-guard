print("Starting script...")
from supabase import create_client

SUPABASE_URL = 'https://dwqgopgljgdlsffqsioj.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cWdvcGdsamdkbHNmZnFzaW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTA4MzAsImV4cCI6MjA4NDI2NjgzMH0.eryK5bg7dT5gcdT8vyYffc7q8UjyP6TgcCv9G19KA7o'

try:
    print("Creating Supabase client...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Connected to Supabase")

    print("Executing query...")
    result = supabase.table('transactions').select('transaction_id, amount, fraud_status').limit(10).execute()
    print(f"Query executed, got {len(result.data)} results")

    if result.data:
        print('Sample transactions:')
        for txn in result.data[:5]:
            print(f'  ID: {txn.get("transaction_id")}, Amount: {txn.get("amount")}, Status: {txn.get("fraud_status")}')
    else:
        print("No transactions found in database")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()