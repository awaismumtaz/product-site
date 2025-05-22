# Product Site Backend (.NET API)

This directory contains the .NET API for the Product Site application.

## Project Structure

-   `ProductSite.Api/`: Contains the main API project.
-   `ProductSite.sln`: Visual Studio solution file.

## Prerequisites

-   [.NET SDK](https://dotnet.microsoft.com/download) (Specify version, e.g., .NET 8.0)
-   [Optional: SQL Server, PostgreSQL, etc., if a database is used]

## Getting Started

1.  **Navigate to the API project directory:**
    ```bash
    cd ProductSite.Api
    ```
2.  **Restore dependencies:**
    ```bash
    dotnet restore
    ```
3.  **Build the project:**
    ```bash
    dotnet build
    ```
4.  **Run the project:**
    ```bash
    dotnet run
    ```
    Alternatively, you can open `ProductSite.sln` in Visual Studio or JetBrains Rider and run the project from the IDE.

## Configuration

-   Application settings are typically managed in `ProductSite.Api/appsettings.json` and `ProductSite.Api/appsettings.Development.json`.
-   Ensure any required connection strings, API keys, or other environment-specific settings are configured correctly.

## API Endpoints

-   [Optional: Briefly describe key endpoints or link to Swagger/OpenAPI documentation, e.g., available at /swagger when the API is running.] 