###############################
# Lambda + API Gateway config (fixed: literal "$default", correct path to artifact)
###############################

# IAM policy for Lambda: allow DynamoDB, SNS and CloudWatch Logs actions
resource "aws_iam_policy" "lambda_dynamo_sns" {
  name = "${var.project_prefix}-lambda-dyn-sns"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        Resource = aws_dynamodb_table.events.arn
      },
      {
        Effect = "Allow",
        Action = [
          "sns:Publish"
        ],
        Resource = aws_sns_topic.alerts.arn
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Attach the custom policy to the existing lambda role
resource "aws_iam_role_policy_attachment" "lambda_custom_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamo_sns.arn
}

# Lambda function (ingest)
resource "aws_lambda_function" "ingest" {
  function_name = "${var.project_prefix}-ingest"
  role          = aws_iam_role.lambda_role.arn
  handler       = "ingest.handler"
  runtime       = "python3.10"
  filename      = "${path.module}/../artifacts/ingest.zip"
  source_code_hash = filebase64sha256("${path.module}/../artifacts/ingest.zip")
  memory_size   = 256
  timeout       = 10

  environment {
    variables = {
      EVENTS_TABLE   = aws_dynamodb_table.events.name
      SNS_TOPIC_ARN  = aws_sns_topic.alerts.arn
      ALERT_THRESHOLD = "100.0"
    }
  }
}

# Allow API Gateway (HTTP API) to invoke the function
resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest.function_name
  principal     = "apigateway.amazonaws.com"
}

# HTTP API (API Gateway v2)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_prefix}-http-api"
  protocol_type = "HTTP"
}

# Integration: AWS_PROXY to Lambda (v2)
resource "aws_apigatewayv2_integration" "ingest" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.ingest.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

# Route for POST /v1/events
resource "aws_apigatewayv2_route" "ingest_route" {
  api_id = aws_apigatewayv2_api.http_api.id
  route_key = "POST /v1/events"
  target = "integrations/${aws_apigatewayv2_integration.ingest.id}"
}

# Stage: auto-deploy (use literal "$default" name)
resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.http_api.id
  name   = "$default"
  auto_deploy = true
}

# Optional SNS subscription to admin email (create only if admin_email non-empty)
resource "aws_sns_topic_subscription" "admin_email_sub" {
  count     = length(trimspace(var.admin_email)) > 0 ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.admin_email
}

# Output API endpoint
output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
  description = "HTTP API endpoint (POST /v1/events)"
}
