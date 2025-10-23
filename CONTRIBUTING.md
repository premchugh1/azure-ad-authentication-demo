# Contributing to Azure AD Authentication Demo

Thank you for your interest in contributing to this project! This guide will help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project follows the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). By participating, you are expected to uphold this code.

## How to Contribute

There are many ways to contribute to this project:

- 🐛 **Report bugs** - Found an issue? Let us know!
- 💡 **Suggest enhancements** - Have ideas for improvements?
- 📝 **Improve documentation** - Help others understand the project better
- 🔧 **Submit fixes** - Fix bugs or implement new features
- ⭐ **Star the repository** - Show your support!

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/azure-ad-authentication-demo.git
   cd azure-ad-authentication-demo
   ```

3. **Set up the development environment** following our [Developer Setup Guide](SETUP_FOR_DEVELOPERS.md)

4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Prerequisites
- Node.js 18+ and npm
- Azure CLI
- Git
- Azure subscription with appropriate permissions

### Local Development Setup
1. Follow the complete setup guide in [SETUP_FOR_DEVELOPERS.md](SETUP_FOR_DEVELOPERS.md)
2. Ensure both SPA and API are running locally
3. Test authentication flow before making changes

### Code Standards
- Use consistent indentation (2 spaces)
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation for API changes
- Test your changes thoroughly

### Testing Your Changes
1. **Local Testing**:
   - Start both SPA and API locally
   - Test authentication flow end-to-end
   - Verify CORS settings work correctly

2. **Azure Testing**:
   - Deploy changes to Azure (if applicable)
   - Test with production Azure AD configuration
   - Verify no breaking changes

## Pull Request Process

### Before Submitting
- [ ] Code follows project standards
- [ ] All tests pass locally
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or clearly documented)
- [ ] Tested with both local and Azure environments

### Submitting Your PR
1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots (if UI changes)
   - Testing instructions
   - Reference to related issues

### PR Review Process
1. Automated checks will run
2. Maintainers will review your code
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## Issue Reporting

### Bug Reports
When reporting bugs, please include:
- **Environment**: OS, Node.js version, browser (if applicable)
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Complete error messages and stack traces

### Feature Requests
For feature requests, please include:
- **Problem**: What problem does this solve?
- **Solution**: Your proposed solution
- **Alternatives**: Any alternative solutions considered
- **Additional context**: Screenshots, mockups, etc.

## Development Environment

### SPA Development (React)
```bash
cd spa
npm install
npm start
```

### API Development (Azure Functions)
```bash
cd api-test
npm install
func start
```

### Common Commands
```bash
# Install all dependencies
npm run install-all

# Start both SPA and API
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
azure-ad-authentication-demo/
├── spa/                    # React SPA application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── authConfig.js   # MSAL configuration
│   │   └── App.js         # Main application
├── api-test/              # Azure Functions API
│   ├── src/functions/     # Function definitions
│   └── host.json         # Function app configuration
├── docs/                  # Additional documentation
└── README.md             # Project overview
```

## Getting Help

- 📖 Check our [documentation](README.md)
- 🔧 See [troubleshooting guide](TROUBLESHOOTING.md)
- 💬 Open an issue for questions
- 📧 Contact maintainers for private matters

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing! Your efforts help make this project better for everyone. 🎉