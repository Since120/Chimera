$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudGp3aGxyeXpvenVzbnBhZ2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzg5MjQ3NCwiZXhwIjoyMDI5NDY4NDc0fQ.nt-wbK4-QwsHHBExlnUZn-UXD5U4-xd2JGO_LnZ5YXo'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudGp3aGxyeXpvenVzbnBhZ2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzg5MjQ3NCwiZXhwIjoyMDI5NDY4NDc0fQ.nt-wbK4-QwsHHBExlnUZn-UXD5U4-xd2JGO_LnZ5YXo'
    'Content-Type' = 'application/json'
}

$body = @{
    sql = 'SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'' ORDER BY table_name;'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'https://sntjwhlryzozusnpaglx.supabase.co/rest/v1/rpc/execute_sql' -Method Post -Headers $headers -Body $body
