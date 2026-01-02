variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "storybook-internal"
}

variable "vpc_id" {
  description = "ID of the Internal VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of Private Subnet IDs for Fargate and ALB"
  type        = list(string)
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port exposed by the docker container"
  type        = number
  default     = 80
}
