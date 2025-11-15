# terraform/analyzer.tf
resource "aws_dynamodb_table" "aggregates" {
  name         = "${var.project_prefix}-aggregates"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "agg_id"

  attribute {
    name = "agg_id"
    type = "S"
  }

  tags = var.tags
}

resource "aws_lambda_function" "analyzer" {
  function_name = "${var.project_prefix}-analyzer"
  role          = aws_iam_role.lambda_role.arn
  handler       = "analyze.handler"
  runtime       = "python3.10"
  filename      = "${path.module}/../artifacts/analyzer.zip"
  source_code_hash = filebase64sha256("${path.module}/../artifacts/analyzer.zip")
  memory_size = 256
  timeout     = 30

  environment {
    variables = {
      EVENTS_TABLE     = aws_dynamodb_table.events.name
      AGG_TABLE        = aws_dynamodb_table.aggregates.name
      SNS_TOPIC_ARN    = aws_sns_topic.alerts.arn
      ANALYZE_THRESHOLD = "150.0"
    }
  }

  depends_on = [aws_iam_role_policy.lambda_dynamo_sns] # ensure IAM policy exists/updated
}

resource "aws_cloudwatch_event_rule" "analyzer_schedule" {
  name                = "${var.project_prefix}-analyzer-schedule"
  description         = "Run analyzer every 5 minutes"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "analyzer_target" {
  rule      = aws_cloudwatch_event_rule.analyzer_schedule.name
  arn       = aws_lambda_function.analyzer.arn
  target_id = "analyzer-lambda"
}

resource "aws_lambda_permission" "analyzer_eventbridge" {
  statement_id  = "AllowEventBridgeInvokeAnalyzer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analyzer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.analyzer_schedule.arn
}
