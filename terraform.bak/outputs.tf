output "dynamodb_table_name" { value = aws_dynamodb_table.events.name }
output "frontend_bucket"     { value = aws_s3_bucket.frontend.bucket }
output "sns_topic_arn"       { value = aws_sns_topic.alerts.arn }
