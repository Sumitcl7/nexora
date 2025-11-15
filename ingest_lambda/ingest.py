import os, json, time, boto3, logging
from botocore.exceptions import ClientError
from decimal import Decimal

# configure logging to stdout (CloudWatch will pick this up)
logger = logging.getLogger()
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Use local region if AWS_REGION not set
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION'))
TABLE_NAME = os.environ.get('EVENTS_TABLE', 'nexora-events')
table = dynamodb.Table(TABLE_NAME)
sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION'))
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', '')

def validate_payload(payload):
    required = ['device_id','timestamp','value']
    return isinstance(payload, dict) and all(k in payload for k in required)

# helper to allow json.dumps to serialize Decimal
def decimal_default(obj):
    if isinstance(obj, Decimal):
        # convert to float for payload responses (safe for display)
        return float(obj)
    raise TypeError

def handler(event, context):
    logger.info("Invocation received; event keys: %s", list(event.keys()) if isinstance(event, dict) else "non-dict")
    try:
        body = event.get('body') if isinstance(event, dict) else None
        if body is None:
            payload = event
        else:
            payload = json.loads(body) if isinstance(body, str) else body

        if not validate_payload(payload):
            logger.warning("Invalid payload: %s", payload)
            return {'statusCode':400, 'body': json.dumps({'msg':'invalid payload'})}

        # store value as Decimal to be compatible with DynamoDB
        val = Decimal(str(payload['value']))

        item = {
            'device_id': str(payload['device_id']),
            'timestamp': int(payload['timestamp']),
            'value': val,
            'created_at': int(time.time())
        }

        logger.info("Attempting to write item to DynamoDB table '%s': %s", TABLE_NAME, item)
        try:
            resp = table.put_item(Item=item)
            logger.info("DynamoDB put_item response: %s", resp)
        except ClientError as e:
            logger.exception("DynamoDB ClientError while putting item")
            return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
        except Exception as e:
            logger.exception("Unexpected error while putting item")
            return {'statusCode':500, 'body': json.dumps({'error': str(e)})}

        # Publish SNS alert on threshold
        try:
            threshold = Decimal(str(os.environ.get('ALERT_THRESHOLD', '100.0')))
            if item['value'] > threshold and SNS_TOPIC_ARN:
                sns_resp = sns.publish(TopicArn=SNS_TOPIC_ARN, Message=json.dumps(item, default=decimal_default))
                logger.info("SNS publish response: %s", sns_resp)
        except Exception:
            logger.exception("Error publishing to SNS (non-fatal)")

        # Return stored item but convert Decimal to float for JSON
        return {'statusCode':200, 'body': json.dumps({'msg':'stored','item':item}, default=decimal_default)}
    except ClientError as e:
        logger.exception("ClientError in handler")
        return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
    except Exception as e:
        logger.exception("Unhandled exception in handler")
        return {'statusCode':500, 'body': json.dumps({'error': str(e)})}
