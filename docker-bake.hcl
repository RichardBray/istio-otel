group "default" {
  targets = ["frontend", "backend"]
}

variable "OTEL_ENABLED" {
  default = "false"
}

target "frontend" {
  context = "./frontend"
  dockerfile = "frontend.Dockerfile"
  args = {
    OTEL_ENABLED = OTEL_ENABLED
  }
  tags = ["myapp/frontend"]
}

target "backend" {
  context = "./backend"
  dockerfile = "backend.Dockerfile"
  args = {
    OTEL_ENABLED = OTEL_ENABLED
  }
  tags = ["myapp/backend"]
}