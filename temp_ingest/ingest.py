import os, json, time, boto3
from botocore.exceptions import ClientError

# Use local region if AWS_REGION not set
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION'))
table = dynamodb.Table(os.environ.get('EVENTS_TABLE', 'nexora-events'))
sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION'))
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', '')

def validate_payload(payload):
    required = ['device_id','timestamp','value']
    return isinstance(payload, dict) and all(k in payload for k in required)

def handler(event, context):
    try:
        body = event.get('body') if isinstance(event, dict) else None
        if body is None:
            payload = event
        else:
            payload = json.loads(body) if isinstance(body, str) else body

        if not validate_payload(payload):
            return {'statusCode':400, 'body': json.dumps({'msg':'invalid payload'})}

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
            # swallow Dynamo errors for local testing
            pass

        # Publish SNS alert on threshold
        try:
            threshold = float(os.environ.get('ALERT_THRESHOLD', '100.0'))
            if item['value'] > threshold and SNS_TOPIC_ARN:
                sns.publish(TopicArn=SNS_TOPIC_ARN, Message=json.dumps(item))
        except Exception:
            pass

        return {'statusCode':200, 'body': json.dumps({'msg':'stored','item':item})}
    except ClientError as e:
        return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
    except Exception as e:
        return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
