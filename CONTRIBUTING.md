# Contributing to HealthPulse Pro

Thank you for your interest in contributing to HealthPulse Pro! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

### Suggesting Features

For feature requests:
- Describe the feature and its use case
- Explain why it would be valuable
- Provide examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit with clear messages (`git commit -m 'Add AmazingFeature'`)
6. Push to your branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install --legacy-peer-deps`
3. Copy `.env.example` to `.env.local` and configure
4. Run development server: `npm run dev`

### Code Style

- Follow existing code formatting
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions focused and concise

### Testing

- Test your changes locally
- Ensure no breaking changes to existing functionality
- Add tests for new features when applicable

## Questions?

Feel free to open an issue for questions or discussions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
