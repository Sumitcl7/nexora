import boto3
d = boto3.client("dynamodb", region_name="us-east-1")
resp = d.scan(TableName="-aggregates", Limit=20)
print(resp)
