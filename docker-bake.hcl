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
  tags = ["richobray/frontend"]
  platforms = ["linux/amd64", "linux/arm64"]
}

target "backend" {
  context = "./backend"
  dockerfile = "backend.Dockerfile"
  args = {
    OTEL_ENABLED = OTEL_ENABLED
  }
  tags = ["richobray/backend"]
  platforms = ["linux/amd64", "linux/arm64"]
}
