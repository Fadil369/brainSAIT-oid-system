#!/bin/bash

# Set strict error handling
set -e

echo "🧪 Starting aggressive testing for BrainSAIT OID System"
echo "======================================================="

# 1. Build and start the Docker environment
echo "🐳 Building and starting Docker containers..."
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start up..."
sleep 10

# 2. Test backend API endpoints
echo "🧪 Testing backend API endpoints..."

# Test GET /oids
echo "Testing GET /oids"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/oids

# Test POST /oids
echo "Testing POST /oids"
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"user_id":"test_user","name":"Test Badge","role":"tester","access_level":"low","expires":"2026-01-01T00:00:00"}' \
  -o /dev/null -w "%{http_code}\n" \
  http://localhost:8000/oids

# Get created OID for further testing
OID=$(curl -s http://localhost:8000/oids | grep -o '"oid":"[0-9]*"' | head -1 | sed 's/"oid":"//;s/"//')
if [ -z "$OID" ]; then
  echo "❌ Failed to get a valid OID from the API"
  OID="1001" # Fallback to a default value for testing
else
  echo "📝 Using OID: $OID for further tests"
fi

# Test PUT /oids/{oid}
echo "Testing PUT /oids/$OID"
curl -s -X PUT -H "Content-Type: application/json" \
  -d '{"user_id":"updated_user","name":"Updated Badge","role":"admin","access_level":"high","expires":"2026-06-01T00:00:00"}' \
  -o /dev/null -w "%{http_code}\n" \
  http://localhost:8000/oids/$OID

# Test DELETE /oids/{oid}
echo "Testing DELETE /oids/$OID"
curl -s -X DELETE -o /dev/null -w "%{http_code}\n" http://localhost:8000/oids/$OID

# 3. Test frontend 
echo "🧪 Testing frontend access..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000

# 4. Run stress test on the API
echo "🧪 Running stress test (100 concurrent requests)..."
for i in {1..100}; do
  curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"user_id\":\"stress_test_$i\",\"name\":\"Stress Badge $i\",\"role\":\"tester\",\"access_level\":\"low\",\"expires\":\"2026-01-01T00:00:00\"}" \
    -o /dev/null http://localhost:8000/oids &
done
wait

echo "✅ Stress test completed"

# 5. Test error handling
echo "🧪 Testing error handling..."
curl -s -X PUT -H "Content-Type: application/json" \
  -d '{"user_id":"invalid_user","name":"Invalid Badge","role":"invalid","access_level":"invalid","expires":"invalid-date"}' \
  -o /dev/null -w "%{http_code}\n" \
  http://localhost:8000/oids/99999

echo "======================================================="
echo "✅ All tests completed! Review any failures above."
echo "📊 The system should be accessible at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"

# Option to keep the system running or shut it down
read -p "Do you want to keep the system running? (y/n): " KEEP_RUNNING
if [ "$KEEP_RUNNING" != "y" ]; then
  echo "🛑 Shutting down Docker environment..."
  docker-compose down
  echo "✅ Environment stopped."
fi
