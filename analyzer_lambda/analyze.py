# analyzer_lambda/analyze.py
import os
import json
import time
from decimal import Decimal
import logging
import boto3
from botocore.exceptions import ClientError

# Logging
logger = logging.getLogger()
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
EVENTS_TABLE_NAME = os.environ.get("EVENTS_TABLE", "-events")
AGG_TABLE_NAME = os.environ.get("AGG_TABLE", "-aggregates")
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN", "")
ANALYZE_THRESHOLD = Decimal(str(os.environ.get("ANALYZE_THRESHOLD", "150.0")))

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
events_table = dynamodb.Table(EVENTS_TABLE_NAME)
agg_table = dynamodb.Table(AGG_TABLE_NAME)
sns = boto3.client("sns", region_name=AWS_REGION)

def decimal_to_number(x):
    if isinstance(x, Decimal):
        # convert for JSON output only
        return float(x)
    return x

def compute_aggregate(items):
    vals = []
    for i in items:
        # support either native types or DynamoDB typed dicts
        if isinstance(i.get("value"), dict) and "N" in i["value"]:
            try:
                vals.append(float(i["value"]["N"]))
            except:
                pass
        else:
            try:
                vals.append(float(i.get("value", 0)))
            except:
                pass
    if not vals:
        return {"count": 0, "avg": 0.0, "max": 0.0}
    return {"count": len(vals), "avg": sum(vals) / len(vals), "max": max(vals)}

def handler(event, context):
    logger.info("Analyzer invoked")
    try:
        # For demo simplicity use a scan. In prod use a GSI or time-window query.
        resp = events_table.scan(Limit=1000)
        items = resp.get("Items", [])
        logger.info("Scanned %d items from events table", len(items))

        agg = compute_aggregate(items)
        ts = int(time.time())
        record = {
            "agg_id": f"agg-{ts}",
            "ts": ts,
            "count": int(agg["count"]),
            "avg": Decimal(str(round(agg["avg"], 3))),
            "max": Decimal(str(round(agg["max"], 3)))
        }

        # write to aggregates table
        logger.info("Writing aggregate record: %s", record)
        agg_table.put_item(Item=record)

        # publish alert if threshold exceeded
        try:
            if Decimal(str(record["max"])) > ANALYZE_THRESHOLD and SNS_TOPIC_ARN:
                msg = {"alert": "high", "max": str(record["max"]), "ts": ts}
                sns.publish(TopicArn=SNS_TOPIC_ARN, Message=json.dumps(msg))
                logger.info("Published SNS alert: %s", msg)
        except ClientError:
            logger.exception("SNS publish failed (non-fatal)")

        return {"status": "ok", "record": record}
    except ClientError as e:
        logger.exception("DynamoDB client error")
        return {"status": "error", "error": str(e)}
    except Exception as e:
        logger.exception("Unhandled error")
        return {"status": "error", "error": str(e)}
