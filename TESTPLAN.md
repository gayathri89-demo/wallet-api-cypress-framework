# Wallet API Test Plan

## Objective

The objective of this test plan is to validate the core Wallet API transaction functionality and confirm that transaction processing, wallet balances, transaction records, API contracts, security behavior, and business rules work as expected.

The primary endpoint under test is:

POST /wallet/{walletId}/transaction

Supporting endpoints are used only for test setup and validation:

POST /user/login
GET /user/info/{userId}
GET /wallet/{walletId}
GET /wallet/{walletId}/transaction/{transactionId}
GET /wallet/{walletId}/transactions

---

## Scope

### In Scope

- Wallet credit transactions
- Wallet debit transactions
- Multi-currency support
- Wallet balance validation
- Transaction retrieval by transaction ID
- Transaction history validation
- Security validation for missing Bearer token
- Payload validation
- Business-rule validation for insufficient balance
- Schema validation using AJV
- Mock mode execution
- Real API execution support
- Mochawesome reporting
- CI execution through GitHub Actions

### Out of Scope

- Deep authentication testing
- Third-party payment or banking integration testing
- Full performance testing
- Multi-user testing
- Real 30-minute pending transaction timeout automation
- Concurrent transaction testing
- Exhaustive pagination testing

---

## Test Strategy

The test strategy focuses on high-value wallet transaction scenarios rather than exhaustive payload combinations.

Priority is given to:

1. Transaction creation correctness
2. Wallet balance integrity
3. Business-rule enforcement
4. Security behavior
5. API contract validation
6. Transaction auditability through lookup and history endpoints
7. Stable execution using mock mode when the real API is unavailable

The suite is designed to be maintainable by separating test scenarios, API clients, assertions, schemas, and fixtures.

---

## Framework Architecture Used for Testing

┌──────────────────────────────────────────────┐
│                 Test Spec Layer              │
│ cypress/e2e/wallet/walletTransaction.cy.js   │
└───────────────────────────┬──────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────┐
│                   API Layer                  │
│ AuthApi | UserApi | WalletApi                │
└───────────────────────────┬──────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Assertions       │ │ AJV Schemas      │ │ Fixtures         │
│                  │ │                  │ │                  │
│ Status checks    │ │ Contract checks  │ │ Test data        │
│ Body checks      │ │ Required fields  │ │ Mock responses   │
│ Business rules   │ │ Data types       │ │ Reusable payloads│
└──────────────────┘ └──────────────────┘ └──────────────────┘
              │             │             │
              └─────────────┼─────────────┘
                            ▼
┌──────────────────────────────────────────────┐
│          Environment and Configuration       │
│ .env | cypress.config.js | Cypress.env()     │
└──────────────────────────────────────────────┘


## Test Execution Flow


┌──────────────────────┐
│ Cypress starts       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Load config and env  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Check USE_MOCKS      │
└───────┬────────┬─────┘
        │        │
        ▼        ▼
┌────────────┐ ┌────────────┐
│ Mock data  │ │ Real API   │
└─────┬──────┘ └─────┬──────┘
      │              │
      └──────┬───────┘
             ▼
┌──────────────────────┐
│ before() setup       │
│ - Load fixtures      │
│ - Login              │
│ - Validate login     │
│ - Get user info      │
│ - Validate user info │
│ - Store token        │
│ - Store walletId     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Execute scenarios    │
│ Security             │
│ Positive flows       │
│ Balance validation   │
│ Retrieval            │
│ Negative validation  │
│ Business rules       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ API client call      │
│ WalletApi methods    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Response received    │
└───────┬────────┬─────┘
        │        │
        ▼        ▼
┌────────────┐ ┌────────────┐
│ Assertion  │ │ AJV schema │
│ validation │ │ validation │
└─────┬──────┘ └─────┬──────┘
      │              │
      └──────┬───────┘
             ▼
┌──────────────────────┐
│ Business validation  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Mochawesome report   │
│ HTML + JSON output   │
└──────────────────────┘

## Detailed Functional Flow

Login
 ↓
Validate login response schema
 ↓
Get user information
 ↓
Validate user information schema
 ↓
Retrieve wallet ID
 ↓
Create transaction
 ↓
Validate response status
 ↓
Validate response body through assertion helper
 ↓
Validate transaction schema through AJV
 ↓
Check transaction state
 ├── Pending: log and avoid premature balance assertion
 └── Finished: validate outcome and timestamps
 ↓
Validate wallet state
 ↓
Validate transaction retrieval
 ↓
Validate transaction history
 ↓
Generate Mochawesome report


---

## Test Data Strategy

Test data is maintained in: cypress/fixtures/transactionData.json


Mock responses are maintained in:cypress/fixtures/mockResponses/walletApiMock.json

The test data covers:

- Credit payloads
- Debit payloads
- Balance setup payloads
- Lookup payloads
- History validation payloads
- Negative payloads
- Unsupported currency
- Invalid transaction type
- Large debit amount for insufficient balance validation

---

## Implemented Test Cases

### P1 - Critical Scenarios

#### TC01 - Reject transaction without Bearer token

**Objective**  
Verify that unauthenticated transaction requests are rejected.

**Steps**

1. Call `POST /wallet/{walletId}/transaction` without a Bearer token.
2. Send a valid transaction payload.
3. Validate the response.

**Expected Result**  
The API returns `401 Unauthorized` and does not process the transaction.

**Automation Status**  
Covered.

---

#### TC02 - Create valid credit transactions for supported currencies

**Objective**  
Verify that the API accepts valid credit transactions for supported currencies.

**Steps**

1. Login and retrieve wallet ID.
2. Submit valid credit transaction payloads.
3. Validate success response.
4. Validate transaction schema.
5. Validate transaction state.

**Expected Result**  
The transaction is created successfully with a valid transaction ID and valid transaction state.

**Automation Status**  
Covered.

---

#### TC03 - Create a valid debit transaction

**Objective**  
Verify that the API accepts a debit transaction when sufficient balance is available.

**Steps**

1. Create a setup credit transaction.
2. Submit a debit transaction for the same currency.
3. Validate success response.
4. Validate transaction schema.
5. Validate transaction state.

**Expected Result**  
The debit transaction is accepted and returned with a valid transaction ID.

**Automation Status**  
Covered.

---

#### TC04 - Verify balance after approved credit transaction

**Objective**  
Confirm that wallet balance increases after an approved credit transaction.

**Steps**

1. Get wallet balance before credit.
2. Create a credit transaction.
3. Get wallet balance after credit.
4. If transaction is approved, compare before and after balances.

**Expected Result**  
For an approved finished transaction, wallet balance increases by the credited amount.

**Automation Status**  
Covered.

---

#### TC05 - Verify balance after approved debit transaction

**Objective**  
Confirm that wallet balance decreases after an approved debit transaction.

**Steps**

1. Create a setup credit transaction.
2. Get wallet balance before debit.
3. Create a debit transaction.
4. Get wallet balance after debit.
5. If transaction is approved, compare before and after balances.

**Expected Result**  
For an approved finished transaction, wallet balance decreases by the debited amount and remains non-negative.

**Automation Status**  
Covered.

---

#### TC06 - Reject debit greater than available balance

**Objective**  
Verify that the wallet does not allow debit transactions that exceed available balance.

**Steps**

1. Submit a debit transaction with an amount greater than available balance.
2. Validate the response.

**Expected Result**  
The API rejects the transaction using a valid error status such as `400`, `409`, or `422`.

**Automation Status**  
Covered.

---

### P2 - Important Scenarios

#### TC07 - Validate pending or finished transaction status

**Objective**  
Verify that transaction status follows the expected API state model.

**Steps**

1. Create a transaction.
2. Validate status.
3. If status is `pending`, do not expect final outcome.
4. If status is `finished`, validate outcome and updated timestamp.

**Expected Result**  
Transaction status is either `pending` or `finished`. Finished transactions contain an outcome.

**Automation Status**  
Covered.

---

#### TC08 - Retrieve transaction by transaction ID

**Objective**  
Verify that a created transaction can be retrieved by transaction ID.

**Steps**

1. Create a transaction.
2. Capture `transactionId`.
3. Call the transaction lookup endpoint.
4. Validate returned transaction ID and schema.

**Expected Result**  
The retrieved transaction matches the created transaction ID.

**Automation Status**  
Covered.

---

#### TC09 - Verify transaction history

**Objective**  
Confirm that a created transaction appears in wallet transaction history.

**Steps**

1. Create a transaction.
2. Capture `transactionId`.
3. Call transaction history endpoint.
4. Search the returned list for the created transaction ID.

**Expected Result**  
The created transaction exists in the transaction history list.

**Automation Status**  
Covered.

---

#### TC10 - Reject invalid transaction payloads

**Objective**  
Validate API input validation for invalid request payloads.

**Scenarios Covered**

- Negative amount
- Zero amount
- Missing amount
- Unsupported currency
- Invalid transaction type

**Expected Result**  
The API returns a validation error such as `400 Bad Request` or `422 Unprocessable Entity`.

**Automation Status**  
Covered.

---

## Scenarios Not Implemented
### Pending transaction finalization

Verify that a pending transaction eventually transitions to finished with a valid outcome.

Priority: P1

### Automatic rejection after 30 minutes

Verify that a pending transaction is automatically denied after 30 minutes.

Priority: P1

### Duplicate currency clip validation

Verify that repeated transactions for the same currency do not create duplicate currency clips.

Priority: P2

### Concurrent transaction processing

Verify wallet behavior when multiple debit/credit requests are submitted simultaneously.

Priority: P2

---

### Transaction history pagination

Verify pagination, sorting, and navigation of large transaction histories.

Priority: P3

### Performance and Load Testing

Performance and load testing are outside the main Cypress functional API suite.

They can be handled separately using tools such as k6 or JMeter.

---

## Risks and Mitigations

Transaction Processing Delays
Transactions can remain in a pending state while waiting for external services. To avoid false failures, balance validations are performed only when the transaction is completed.

API Availability
The challenge API may not always be available during development or CI execution. A mock mode (USE_MOCKS=true) was implemented to allow tests to run independently of the live service.

---

## Entry Criteria

- Dependencies are installed successfully.
- `.env` file is configured for local execution.
- API endpoint is available for real API mode.
- Test credentials are available for real API mode.
- Mock fixtures are available for mock mode.
- Cypress can start successfully.

---

## Exit Criteria

- Wallet API suite executes successfully.
- Critical transaction flows pass.
- Security validation is covered.
- Business-rule validation is covered.
- Schema validation is covered.
- Transaction retrieval and history checks are covered.
- Mochawesome report is generated.
- Coverage and limitations are documented.

---

## Final Automated Flow / Coverage summary

BEFORE
│
├── Load transaction fixture data
├── Login
├── Validate login response schema
├── Get user info
├── Validate user info response schema
└── Store token and wallet ID

1. Security Validation
│
└── Reject transaction without Bearer token

2. Positive Transaction Creation
│
├── Create valid credit transactions for supported currencies
├── Create valid debit transaction after setup credit
└── Validate pending or finished transaction status

3. Wallet Balance Validation
│
├── Verify approved credit increases balance
├── Verify denied credit does not change balance
├── Verify approved debit decreases balance
├── Verify denied debit does not change balance
└── Avoid premature balance assertion for pending transaction

4. Transaction Retrieval
│
├── Get transaction by transaction ID
└── Verify created transaction appears in transaction history

5. Negative Validation
│
└── Reject invalid payloads
    ├── Negative amount
    ├── Zero amount
    ├── Missing amount
    ├── Unsupported currency
    └── Invalid transaction type

6. Business Rule Validation
│
├── Reject debit greater than available balance

7. Schema Validation
│
├── Login response schema
├── User info response schema
├── Wallet response schema
├── Transaction response schema
└── Transaction history schema

8. Reporting
│
├── Mochawesome HTML report
├── Mochawesome JSON report
└── Cypress screenshot on failure

## Recommended Execution Commands

Install dependencies:

```bash
npm install
```

Run wallet tests:

```bash
npm run test:wallet
```

Run with mock mode locally:

```bash
USE_MOCKS=true npm run test:wallet
```

On Windows PowerShell:

```powershell
$env:USE_MOCKS="true"
npm run test:wallet
```

Run Cypress UI:

```bash
npm run test:open
```

---

## Submission Notes

- API clients support mock and real API execution.
- Assertions are centralized in the assertions folder.
- AJV schemas validate response contracts.
- Fixtures manage reusable test data.
- Mochawesome provides execution reports.
- GitHub Actions supports CI execution.
- Test specs use API clients instead of direct `cy.request()` calls.
