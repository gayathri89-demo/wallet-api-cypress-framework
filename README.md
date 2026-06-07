# Wallet API Cypress Automation Framework

## Overview

This project contains an automated API test suite for the Wallet REST API challenge.

The primary endpoint under test is:

POST /wallet/{walletId}/transaction

The framework also validates supporting wallet functionality such as wallet retrieval, balance validation, transaction lookup, transaction history, schema validation, security checks, and business rules.

The suite is built using Cypress and JavaScript with a layered architecture that separates test logic, API communication, assertions, schemas, and test data.

---

## Technology Stack

- Cypress
- JavaScript
- Mocha / Chai
- AJV
- Mochawesome
- dotenv
- GitHub Actions

---

## Framework Features

- Layered API automation architecture
- Reusable API client classes
- Centralized assertion helpers
- AJV schema validation
- Fixture-driven test data
- Mock mode support
- Real API mode support
- Multi-currency transaction coverage
- Business-rule validation
- Transaction retrieval validation
- Transaction history validation
- Mochawesome reporting
- Failure screenshots
- GitHub Actions CI integration

---

## Development Approach

The framework was developed incrementally using a test-first and iterative approach.

The implementation started with the core transaction flow and gradually evolved through several improvements including:

- Reusable API client classes
- Fixture-driven test data
- AJV schema validation
- Assertion helper classes
- Mock execution support
- Business-rule validation
- Reporting and debugging support
- CI/CD integration

Several refinements were made during development based on issues encountered while testing, including transaction state handling, schema alignment, balance validation logic, and API availability.

The commit history reflects these incremental improvements and design decisions.

---

## Endpoint Coverage

Although the challenge focuses primarily on transaction processing, the framework interacts with all endpoints provided in the API specification.

| Endpoint | Purpose |
|-----------|----------|
| POST /user/login | Authentication setup |
| GET /user/info/{userId} | Retrieve user and wallet information |
| GET /wallet/{walletId} | Wallet validation |
| POST /wallet/{walletId}/transaction | Primary endpoint under test |
| GET /wallet/{walletId}/transaction/{transactionId} | Transaction retrieval validation |
| GET /wallet/{walletId}/transactions | Transaction history validation |

---

## Project Structure

[preserve your existing Project Structure section]

---

## Framework Architecture

[preserve your existing Architecture Diagram]

---

## Test Execution Flow

[preserve your existing Execution Flow Diagram]

---

## Test Approach

1. Authenticate user.
2. Retrieve user information.
3. Extract wallet ID.
4. Create transactions.
5. Validate response codes.
6. Validate response payloads.
7. Validate schemas.
8. Verify wallet balance changes.
9. Verify transaction retrieval.
10. Verify transaction history.
11. Verify negative scenarios and business rules.

---

## Test Coverage

### Supporting Endpoint Validation

- Login setup
- User information retrieval
- Wallet retrieval

### Functional Coverage

- Credit transaction
- Debit transaction
- Decimal amount transaction
- Multi-currency transaction
- Transaction retrieval
- Transaction history verification

### Business Rule Coverage

- Credit increases balance
- Debit decreases balance
- Negative balance prevention
- Duplicate currency clip prevention
- Denied transaction validation
- Pending transaction handling

### Security Coverage

- Missing Bearer token validation

### Payload Validation

- Negative amount
- Zero amount
- Missing amount
- Unsupported currency
- Invalid transaction type

### Schema Validation

- Login response
- User response
- Wallet response
- Transaction response
- Transaction history response

---

## Mock Mode and Real API Mode

[preserve your existing section]

---

## Prerequisites

[preserve existing section]

---

## Installation

[preserve existing section]

---

## Environment Configuration

[preserve existing section]

---

## Running Tests

[preserve existing section]

---

## Reporting

[preserve existing section]

---

## CI/CD Execution

[preserve existing section]

---

## Key Files and Responsibilities

[preserve existing table]

---

## Assumptions

[preserve existing section]

---

## Risks and Mitigations

### Transaction Processing Delays

Transactions may remain in a pending state while waiting for external services. Balance validations are performed only after the transaction reaches a final state.

### Shared Wallet State

Previous transactions may influence wallet balances and transaction history. Controlled transaction amounts and setup data are used to reduce test dependencies.

### API Availability

The challenge API was not always accessible during development. Mock mode was implemented to allow local and CI execution without relying on the live environment.

### Response Variability

Transaction outcomes may vary depending on processing time. Assertions allow all valid documented response states.

### Secrets Management

Credentials and configuration values are managed through environment variables and should never be committed to source control.

---

## Known Limitations

- Pending transaction timeout (30 minutes) is not automated.
- Concurrency testing is not automated.
- Large-scale pagination testing is not automated.
- Performance testing is outside the scope of this suite.
- Real API availability cannot be guaranteed.

---

## Summary

This framework focuses on wallet transaction processing as required by the challenge while maintaining a clean, scalable, and maintainable architecture.

Supporting endpoints are used to establish test preconditions and validate transaction outcomes. Schema validation, business-rule assertions, reporting, mock execution support, and CI integration provide additional confidence in the overall solution quality.

---

## LLM Disclosure

## LLM Disclosure

AI-assisted tools were used during development as productivity and review aids. All generated suggestions were reviewed, modified, and validated before submission.

### Tools Used

GitHub Copilot - GPT-5 mini - Used inside Visual Studio Code for code completion, refactoring suggestions, repetitive boilerplate generation, and minor documentation assistance. 

ChatGPT - GPT-5.5 - Used for code review, framework structure review, documentation support, schema validation discussions, README/TESTPLAN refinement, and architecture explanation. 

### How AI Assistance Was Used

- Improve or refactor and review the Cypress API framework structure.
- Code review, documentation support and mock strategy guidance.


### Author Validation

AI-assisted tools were used as productivity and review aids during development. All code changes, test coverage decisions, schema implementations, business-rule validations, and documentation were designed, implemented, reviewed, and validated by the author.

The commit history reflects the evolution of the framework through iterative development, testing, defect investigation, issue resolution, refactoring, and continuous improvement.