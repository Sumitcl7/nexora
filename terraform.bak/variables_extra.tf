variable "admin_email" {
  description = "Admin email for SNS alerts (optional). Leave empty to skip creating subscription."
  type        = string
  default     = ""
}
