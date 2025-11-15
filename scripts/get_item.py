import boto3, json, sys
d = boto3.client('dynamodb')

# CHANGE THESE if you want a different key
table_name = "-events"
key = {
  "device_id": {"S": "device-debug-2"},
  "timestamp": {"N": "1763236095"}
}

try:
    resp = d.get_item(TableName=table_name, Key=key)
    # print full raw response
    print(json.dumps(resp, indent=2, default=str))
except Exception as e:
    print("ERROR:", str(e), file=sys.stderr)
    raise
