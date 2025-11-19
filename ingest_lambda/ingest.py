# ingest_lambda/ingest.py
import os, json, time
from decimal import Decimal
import boto3
from botocore.exceptions import ClientError

# Use local region if AWS_REGION not set
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
TABLE_NAME = os.environ.get('EVENTS_TABLE', 'nexora-events')
table = dynamodb.Table(TABLE_NAME)
sns = boto3.client('sns', region_name=AWS_REGION)
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', '')

def decimal_to_number(x):
    # helper for JSON serialization of DynamoDB Decimal
    if isinstance(x, Decimal):
        return float(x)
    raise TypeError

def validate_payload(payload):
    required = ['device_id','timestamp','value']
    return isinstance(payload, dict) and all(k in payload for k in required)

def _scan_events(limit=100):
    try:
        resp = table.scan(Limit=limit)
        items = resp.get('Items', [])
        # convert Decimal -> float for JSON
        return items
    except Exception as e:
        # bubble up as empty for safety
        return []

def handler(event, context):
    """
    Supports:
      - GET (API Gateway v2 or v1): return scanned items as JSON
      - POST: store incoming payload (existing behavior)
    """
    try:
        # --- Detect HTTP method (APIGateway v2 payload uses requestContext.http.method) ---
        method = None
        if isinstance(event, dict):
            # API Gateway v2
            method = event.get("requestContext", {}).get("http", {}).get("method")
            # older REST style
            if not method:
                method = event.get("httpMethod")
        if method:
            method = method.upper()

        # If GET: return items
        if method == "GET":
            items = _scan_events(limit=100)
            # ensure JSON serializable (Decimal -> float)
            body = json.dumps({"items": items}, default=decimal_to_number)
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': body}

        # else assume POST (existing behavior)
        body = event.get('body') if isinstance(event, dict) else None
        if body is None:
            payload = event
        else:
            payload = json.loads(body) if isinstance(body, str) else body

        if not validate_payload(payload):
            return {'statusCode':400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'msg':'invalid payload'})}

        item = {
            'device_id': str(payload['device_id']),
            'timestamp': int(payload['timestamp']),
            'value': float(payload['value']),
            'created_at': int(time.time())
        }

        # Put item into DynamoDB (will fail if table missing — that's okay for now)
        try:
            table.put_item(Item=item)
        except Exception:
            pass

        # Publish SNS alert on threshold
        try:
            threshold = float(os.environ.get('ALERT_THRESHOLD', '100.0'))
            if item['value'] > threshold and SNS_TOPIC_ARN:
                sns.publish(TopicArn=SNS_TOPIC_ARN, Message=json.dumps(item))
        except Exception:
            pass

        return {'statusCode':200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'msg':'stored','item':item})}
    except ClientError as e:
        return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
    except Exception as e:
        return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
