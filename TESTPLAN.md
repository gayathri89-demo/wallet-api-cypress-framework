# Wallet API Test Plan

## Objective

The objective of this test plan is to validate the core wallet transaction functionality and ensure that balances, transaction records, security controls, and business rules behave as expected.

The primary endpoint under test is:

```http
POST /wallet/{walletId}/transaction
```

Supporting endpoints are used to verify transaction outcomes:

```http
GET /wallet/{walletId}
GET /wallet/{walletId}/transaction/{transactionId}
GET /wallet/{walletId}/transactions
```

---

## Scope

### In Scope

* Credit transactions
* Debit transactions
* Multi-currency support
* Decimal amount handling
* Wallet balance validation
* Transaction retrieval
* Transaction history validation
* Security validation
* Payload validation
* Insufficient balance handling

### Out of Scope

* Deep authentication testing
* Third-party banking integrations
* Performance testing
* Load testing
* Multi-user isolation testing
* Real 30-minute timeout validation

---

## Test Strategy

The implementation focuses on high-value business scenarios rather than exhaustive combinations.

Priority was given to:

1. Transaction processing
2. Wallet balance integrity
3. Business-rule enforcement
4. Security validation
5. Transaction retrieval and auditability

---

## Test Execution Flow

```text
Login
 ↓
Get User Information
 ↓
Retrieve Wallet ID
 ↓
Create Transaction
 ↓
Validate Response
 ↓
Validate Wallet State
 ↓
Validate Transaction History
```

---

## Implemented Test Cases

### P1 - Critical

#### TC01 - Reject transaction without Bearer token

**Objective**

Verify that unauthenticated requests are rejected.

**Expected Result**

API returns an unauthorized response.

---

#### TC02 - Create valid credit transactions

**Objective**

Verify successful credit transactions for supported currencies.

**Expected Result**

Transaction is created successfully and response schema is valid.

---

#### TC03 - Create valid debit transaction

**Objective**

Verify successful debit transactions when sufficient funds are available.

**Expected Result**

Debit transaction is approved and processed successfully.

---

#### TC04 - Verify balance after credit transaction

**Objective**

Confirm wallet balance increases after an approved credit transaction.

**Expected Result**

Balance increases by the credited amount.

---

#### TC05 - Verify balance after debit transaction

**Objective**

Confirm wallet balance decreases after an approved debit transaction.

**Expected Result**

Balance decreases by the debited amount.

---

#### TC06 - Reject debit greater than available balance

**Objective**

Verify wallet balances cannot become negative.

**Expected Result**

API returns an insufficient balance error.

---

### P2 - Important

#### TC07 - Create credit transaction with decimal amount

**Objective**

Validate support for decimal amounts.

**Expected Result**

Transaction is processed successfully.

---

#### TC08 - Retrieve transaction by transaction ID

**Objective**

Verify transactions can be retrieved after creation.

**Expected Result**

Returned transaction matches the created transaction.

---

#### TC09 - Verify transaction history

**Objective**

Confirm newly created transactions appear in transaction history.

**Expected Result**

Created transaction exists in the transaction list.

---

#### TC10 - Reject invalid transaction payloads

**Objective**

Validate API input validation.

**Scenarios Covered**

* Negative amount
* Zero amount
* Missing amount
* Unsupported currency
* Invalid transaction type

**Expected Result**

API returns validation errors.

---

## Important Scenarios Not Implemented

### Pending Transaction Processing

The API specification describes asynchronous transaction processing where a transaction may remain in a pending state before being finalized.

This scenario was not fully automated because it requires controllable delayed backend responses.

---

### Automatic Rejection After 30 Minutes

Pending transactions should automatically be rejected after 30 minutes.

This was not automated because it would significantly increase execution time and requires backend time manipulation.

---

### Concurrent Transaction Processing

Simultaneous debit and credit transactions were not implemented because they require dedicated concurrency controls and stable backend state.

---

### Pagination Validation

Transaction history pagination was not implemented because the challenge environment does not provide sufficient historical transaction data.

---

## Risks

| Risk                                  | Mitigation                                                  |
| ------------------------------------- | ----------------------------------------------------------- |
| Transaction may remain pending        | Balance validation only performed for approved transactions |
| Shared wallet state between tests     | Controlled test setup and small transaction amounts         |
| API environment unavailable           | Mock mode available for local execution                     |
| External service response variability | Assertions allow valid outcomes where appropriate           |

---

## Entry Criteria

* Dependencies installed successfully
* Environment variables configured
* API endpoint available
* Test account available
* Cypress execution environment ready

---

## Exit Criteria

* Test suite executes successfully
* Critical transaction flows pass
* Business rules validated
* Reports generated successfully
* Coverage and limitations documented

---

## Coverage Summary

| Area                        | Status     |
| --------------------------- | ---------- |
| Authentication Setup        | Covered    |
| Credit Transactions         | Covered    |
| Debit Transactions          | Covered    |
| Multi-Currency Support      | Covered    |
| Decimal Amounts             | Covered    |
| Wallet Balance Validation   | Covered    |
| Transaction Retrieval       | Covered    |
| Transaction History         | Covered    |
| Security Validation         | Covered    |
| Business Rules              | Covered    |
| Pending Transaction Timeout | Documented |

# Final Flow
BEFORE
│
├── Login
├── Get User Info
└── Get Wallet ID

1. Security
│
└── Reject transaction without token

2. Positive Transactions
│
├── Valid credit transaction (EUR/USD/AED)
├── Decimal amount credit
└── Valid debit transaction

3. Wallet Balance
│
├── Credit increases balance
└── Debit decreases balance

4. Transaction Retrieval
│
├── Get transaction by ID
└── Verify transaction appears in history

5. Negative Validation
│
└── Reject invalid payloads
     ├── Negative amount
     ├── Zero amount
     ├── Missing amount
     ├── Unsupported currency
     └── Invalid type

6. Business Rules
│
└── Reject debit greater than balance
Remove This Test