variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_prefix" {
  description = "Project prefix for resource names"
  default     = "nexora"
}

variable "s3_frontend_bucket" {
  description = "S3 bucket for frontend (set unique name before apply)"
  default     = "nexora-frontend-unique-suffix"
}

variable "tags" {
  type = map(string)
  default = { Project = "NEXORA" }
}
