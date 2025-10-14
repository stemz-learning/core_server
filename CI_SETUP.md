# CI/CD Setup for STEMz Teacher Platform

This document explains the Continuous Integration and Deployment setup for the STEMz Teacher Platform.

## 🚀 GitHub Actions Workflows

### 1. Test Suite (`test.yml`)
**Triggers:** Push/PR to `main` or `develop` branches

**Features:**
- ✅ Runs comprehensive test suite (125 tests across 11 test suites)
- ✅ Node.js 20.x environment
- ✅ Automatic PR comments with test results
- ✅ 100% pass rate requirement

### 2. Full CI/CD Pipeline (`ci.yml`)
**Triggers:** Push/PR to `main` or `develop` branches

**Features:**
- 🧪 **Testing:** Multi-version Node.js testing (18.x, 20.x)
- 🔒 **Security:** npm audit + Snyk security scanning
- 🏗️ **Build:** Application build verification
- 🚀 **Deploy:** Automatic Vercel deployment
- 📢 **Notifications:** Slack integration for deployment status

### 3. Vercel Deployment (`deploy.yml`)
**Triggers:** Push/PR to `main` branch

**Features:**
- ✅ Test suite execution before deployment
- 🚀 Automatic Vercel deployment
- 🌍 Production deployment for `main` branch
- 🧪 Preview deployment for PRs

## 📊 Test Coverage

Our comprehensive test suite includes:

| Component | Test Files | Coverage |
|-----------|------------|----------|
| **Authentication** | `auth.test.js` | User signup, login, verification |
| **User Management** | `user.test.js` | User CRUD operations |
| **Classrooms** | `classroom.test.js` | Classroom management, enrollment |
| **Assignments** | `assignment.test.js` | Assignment creation, management |
| **Grades** | `grade.test.js` | Grade tracking, analytics |
| **Courses** | `course.test.js` | Course management |
| **Worksheets** | `worksheet.test.js` | Worksheet operations |
| **Questions** | `questions.test.js` | Quiz & BPQ questions |
| **User Points** | `userPoint.test.js` | Points tracking, progress |
| **Study Groups** | `studyGroups.test.js` | Study group management |
| **Messages** | `groupMessages.test.js` | Group messaging |

**Total:** 125 tests across 11 test suites with 100% pass rate

## 🔧 Required Secrets

To enable full CI/CD functionality, add these secrets to your GitHub repository:

### Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### Security Scanning (Optional)
```
SNYK_TOKEN=your_snyk_token
```

### Notifications (Optional)
```
SLACK_WEBHOOK=your_slack_webhook_url
```

## 🎯 CI/CD Benefits

### ✅ **Quality Assurance**
- All code changes are automatically tested
- 100% test pass rate required for deployment
- Security vulnerabilities detected early

### 🚀 **Automated Deployment**
- Automatic deployment to staging (`develop` branch)
- Automatic deployment to production (`main` branch)
- Preview deployments for pull requests

### 📊 **Visibility**
- Clear test results in PR comments
- Deployment status notifications
- Security audit reports

### 🔒 **Security**
- Automated security scanning
- Dependency vulnerability detection
- Secure deployment practices

## 🛠️ Local Development

### Running Tests Locally
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

### Pre-commit Checklist
Before pushing code, ensure:
- [ ] All tests pass locally (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code follows project conventions
- [ ] New features have corresponding tests

## 📈 Monitoring

The CI/CD pipeline provides:
- **Test Results:** Real-time test execution status
- **Deployment Status:** Success/failure notifications
- **Security Reports:** Vulnerability scanning results
- **Performance Metrics:** Build and deployment times

## 🔄 Workflow Triggers

| Event | Workflow | Action |
|-------|----------|--------|
| Push to `main` | All workflows | Full CI/CD pipeline |
| Push to `develop` | Test + CI | Staging deployment |
| Pull Request | Test + Deploy | Preview deployment |
| Manual trigger | All workflows | On-demand execution |

---

**🎉 With this CI/CD setup, every code change is automatically tested and deployed with confidence!**
