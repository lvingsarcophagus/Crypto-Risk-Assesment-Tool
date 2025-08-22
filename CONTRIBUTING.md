# Contributing to Crypto Risk Assessment Tool

Thank you for your interest in contributing! We welcome contributions from the community.

## How to Contribute

### 🐛 Reporting Bugs
- Check if the bug has already been reported in [Issues](https://github.com/lvingsarcophagus/Crypto-Risk-Assesment-Tool/issues)
- Create a new issue with a clear title and description
- Include steps to reproduce the bug
- Add relevant labels and screenshots if applicable

### 💡 Suggesting Features
- Check existing feature requests in [Issues](https://github.com/lvingsarcophagus/Crypto-Risk-Assesment-Tool/issues)
- Create a new issue with the "enhancement" label
- Clearly describe the feature and its benefits
- Include mockups or examples if helpful

### 🔧 Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/Crypto-Risk-Assesment-Tool.git
   cd crypto-risk-analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

### 📝 Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm test
   pnpm build
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new risk analysis metric"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### 🎯 Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Maintain consistent formatting with Prettier

### 🧪 Testing

- Write unit tests for new functions
- Test components with React Testing Library
- Ensure all tests pass before submitting
- Add integration tests for API endpoints

### 📋 Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Update documentation
   - Add changelog entry if applicable
   - Rebase on the latest main branch

2. **PR Requirements:**
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Test coverage for new features

3. **Review Process:**
   - Maintainers will review within 48 hours
   - Address feedback and requested changes
   - Squash commits before merging

### 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Celebrate diverse perspectives

### 📞 Questions?

- Open a [Discussion](https://github.com/lvingsarcophagus/Crypto-Risk-Assesment-Tool/discussions)
- Join our community chat
- Email the maintainers

Thank you for contributing! 🚀
