terraform {
  required_providers { aws = { source = "hashicorp/aws" } }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "frontend" {
  bucket = var.s3_frontend_bucket
  acl    = "private"
  force_destroy = true
  tags = var.tags
}

resource "aws_dynamodb_table" "events" {
  name         = "-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "device_id"
  range_key    = "timestamp"

  attribute {
    name = "device_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  tags = var.tags
}

resource "aws_sns_topic" "alerts" {
  name = "-alerts"
  tags = var.tags
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
