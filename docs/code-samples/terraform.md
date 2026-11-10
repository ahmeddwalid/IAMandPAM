---
title: Terraform Code Samples
description: "Terraform configurations for AWS IAM roles, Azure AD app registrations, and GCP service accounts."
---

# Terraform Code Samples

## Prerequisites

```bash
# Install Terraform
brew install terraform  # macOS
# or
sudo apt-get install terraform  # Ubuntu

# Configure AWS credentials
aws configure

# Configure Azure credentials
az login

# Configure GCP credentials
gcloud auth application-default login
```

## AWS IAM: Create a role

```hcl
resource "aws_iam_role" "example" {
  name = "example-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = "production"
    Team        = "security"
  }
}
```

## AWS IAM: Attach a policy

```hcl
resource "aws_iam_role_policy_attachment" "example" {
  role       = aws_iam_role.example.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}
```

## AWS IAM: Create a policy

```hcl
resource "aws_iam_policy" "example" {
  name        = "example-policy"
  description = "Example policy for S3 read access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::example-bucket",
          "arn:aws:s3:::example-bucket/*"
        ]
      }
    ]
  })
}
```

## AWS IAM: Create an instance profile

```hcl
resource "aws_iam_instance_profile" "example" {
  name = "example-profile"
  role = aws_iam_role.example.name
}
```

## AWS IAM: Create a user

```hcl
resource "aws_iam_user" "example" {
  name = "example-user"
  path = "/"

  tags = {
    Environment = "production"
  }
}
```

## AWS IAM: Create an access key

```hcl
resource "aws_iam_access_key" "example" {
  user = aws_iam_user.example.name
}
```

## Azure AD: Create an app registration

```hcl
resource "azuread_application" "example" {
  display_name = "example-app"
  owners       = [data.azuread_client_config.current.object_id]

  web {
    redirect_uris = ["https://example.com/auth/callback"]
  }

  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000"

    resource_access {
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"
      type = "Scope"
    }
  }
}
```

## Azure AD: Create a service principal

```hcl
resource "azuread_service_principal" "example" {
  application_id = azuread_application.example.application_id
}
```

## Azure AD: Create a password

```hcl
resource "azuread_application_password" "example" {
  application_object_id = azuread_application.example.object_id
}
```

## GCP: Create a service account

```hcl
resource "google_service_account" "example" {
  account_id   = "example-sa"
  display_name = "Example Service Account"
  description  = "Service account for example application"
}
```

## GCP: Assign a role

```hcl
resource "google_project_iam_member" "example" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.example.email}"
}
```

## GCP: Create a key

```hcl
resource "google_service_account_key" "example" {
  service_account_id = google_service_account.example.name
}
```

## GCP: Enable an API

```hcl
resource "google_project_service" "example" {
  project = var.project_id
  service = "iam.googleapis.com"
}
```

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `Error: Failed to query available packages` | Terraform not initialized | Run `terraform init` |
| `Error: Invalid provider configuration` | Wrong credentials | Verify AWS/Azure/GCP credentials |
| `Error: Resource already exists` | Duplicate resource | Use `terraform import` or change the resource name |
| `Error: Insufficient permissions` | Missing IAM permissions | Grant the required permissions to the Terraform service account |
| `Error: Timeout` | Resource creation took too long | Increase the timeout or check the provider status |
