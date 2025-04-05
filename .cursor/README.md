# Quartermaster Project Cursor Configuration

This directory contains configuration files for the Cursor editor to ensure consistent code style and development practices across the Quartermaster project.

## Files

- **settings.json**: Editor settings for code formatting, file associations, and recommended extensions
- **rules.yaml**: Project-specific coding standards and conventions

## Setup

1. Cursor will automatically detect these configuration files
2. Make sure to install the recommended extensions
3. Enable "Format on Save" for automatic code formatting

## Key Conventions

- Backend (AdonisJS):
  - Follow AdonisJS directory structure
  - Use camelCase for files and variables
  - Use PascalCase for classes
  - Group controllers by resource

- Frontend (Astro + Svelte):
  - Use kebab-case for files and directories
  - Group components by feature
  - Use TypeScript for type safety
  - Follow Svelte component structure

- Database:
  - Use snake_case for table and column names
  - Document all models
  - Use migrations for schema changes
  - Use parameterized queries for security

- Git Workflow:
  - Use feature branches with `feature/name` format
  - Write descriptive commit messages
  - Keep commits small and focused
  - Follow pull request process

## Code Style

- 2 spaces for indentation
- 100 character line length limit
- Single quotes for strings
- Trailing commas in multiline objects
- Semicolons at the end of statements
- Prefer async/await over Promise chains
- No unused variables or imports
- No console.log in production code

## Recommended Extensions

- ESLint: Code linting
- Prettier: Code formatting
- Svelte for VS Code: Svelte support
- Astro: Astro support
- Tailwind CSS IntelliSense: Tailwind support
- DotENV: Environment file support
- SQLTools: Database connection and queries
- SQLTools PostgreSQL Driver: PostgreSQL support

## Questions?

If you have questions about these configurations, please contact the project maintainers. 