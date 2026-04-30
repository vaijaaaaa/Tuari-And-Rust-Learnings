GOAL : The goal of this research is to understand and implement seamless integration between FarmStack and TallyPrime using TallyPrime’s XML-based API. FarmStack should be able to convert its operational and transaction data into Tally-compatible XML format and push it directly to TallyPrime running on the local machine. This integration should automate the creation of ledgers, sales vouchers, and purchase vouchers without manual accounting entry. The system must also handle Tally’s response XML for success and error validation. Ultimately, the goal is to keep FarmStack’s business operations and Tally’s accounting records synchronized efficiently and accurately.

## Step 1 : Setup Tally Dev Environment onto Your Local PC

Install TallyPrime on Windows.

![image.png](attachment:58f5f056-270c-4456-8be9-5b31c5bbfc91:image.png)

[Download Now - TallyPrime 7.0, TallyPrime Server & Developer](https://tallysolutions.com/download/?srsltid=AfmBOopmIhsFtn9bIH8Q0UYMHnLdm3Mz9fV0xh9BQR11acPUTen3znQn)

Download the TallyPrime Editlog version (Second one)

Create/load one test company, for example:

Company Name: FarmStack Test Company
Financial Year: 2026-2027
Books From: 01-Apr-2026

![image.png](attachment:55f11923-a52b-4980-899e-0ca68a8edf55:image.png)

Enable HTTP/XML access:

TallyPrime → F1 Help → Settings → Advanced Configuration

Enable HTTP Server

Port: 9000

Then test:

```
curl -X POST http://localhost:9000
```

![image.png](attachment:8b293b52-87cf-4f64-9c70-b16751163a21:image.png)

## Step 2: Understand the integration architecture

We will intergrate the tally with the our desktop application using XML Builder

![image.png](attachment:10ae962e-05dd-4d49-8668-1365f40107e7:image.png)

In Tauri app, this can be done from backend/Rust side or local Node/service side.

## Step 3: Research Tally XML request format

TallyPrime accepts XML requests through its local HTTP server, usually `http://localhost:9000`. For importing data from FarmStack into Tally, the request must be wrapped inside an `ENVELOPE`. Inside that, the `HEADER` tells Tally what operation to perform, and the `BODY` contains the actual master or voucher data. For voucher import, Tally’s official sample uses `TALLYREQUEST = Import`, `TYPE = Data`, and `ID = Vouchers`.

The below given XML request creates a ledger in Tally

![image.png](attachment:fa6c3076-9c3e-4886-97dd-425053280091:image.png)

This structure is mainly used for importing sales, purchase, payment, receipt, journal, and other vouchers into Tally.

## Ledger Creation XML

Ledger is the accounting head in Tally. In FarmStack, every farmer, vendor, customer, sales account, purchase account, cash account, and bank account may need to exist as a ledger in Tally.

Minimum required tags:

```
LEDGER  → Main ledger object
NAME    → Ledger name
PARENT  → Tally group under which ledger is created
```

Official Tally sample says `NAME` and `PARENT` are mandatory for ledger creation.

![image.png](attachment:2ce9f3ef-13f5-469c-83c6-3ba885213c12:image.png)

FarmStack mapping:

```
Customer ledger → Sundry Debtors
Farmer ledger → Sundry Creditors
Vendor ledger → Sundry Creditors
Sales ledger → Sales Accounts
Purchase ledger → Purchase Accounts
Cash ledger → Cash-in-Hand
Bank ledger → Bank Accounts
```

Important: before creating vouchers, required ledgers must already exist in Tally. Tally’s guideline clearly says dependent masters must be available before importing transactions

## Sales Voucher XML

A sales voucher records goods/services sold to a customer. In FarmStack, this will be used when produce/items are sold from FarmStack to a customer or buyer.

Important tags:

```
DATE                 → Voucher date in YYYYMMDD format
VOUCHERTYPENAME      → Sales
VOUCHERNUMBER        → Invoice/voucher number
PERSISTEDVIEW        → Accounting Voucher View or Invoice Voucher View
ISINVOICE            → Yes/No
LEDGERENTRIES.LIST   → Ledger debit/credit entries
LEDGERNAME           → Customer or sales ledger name
ISDEEMEDPOSITIVE     → Decides debit/credit behavior
AMOUNT               → Amount value
```

Tally’s official sales voucher sample uses `DATE`, `VOUCHERTYPENAME`, `VOUCHERNUMBER`, `PERSISTEDVIEW`, `ISINVOICE`, and ledger entries.

Simple sales voucher without inventory:

![image.png](attachment:67285652-e3f6-419f-91cf-db2fe7a9fbd5:image.png)

Meaning:

```
Customer ledger → Debited
Sales ledger → Credited
Total debit must equal total credit
```

## Purchase Voucher XML

A purchase voucher records goods purchased from a farmer/vendor. In FarmStack, this is used when produce is procured from farmers or vendors.

The structure is almost the same as sales voucher, but:

```
VOUCHERTYPENAME = Purchase
Party ledger = Farmer/Vendor
Purchase ledger = Purchase
```

Simple purchase voucher without inventory:

![image.png](attachment:597a388c-7db8-48a0-809e-80345ea84e74:image.png)

Meaning:

```
Purchase ledger → Debited
Farmer/Vendor ledger → Credited
```

## Important Rules from Tally Documentation

1. Required ledgers, stock items, units, and other masters must exist before importing vouchers.
2. Voucher date must be in `YYYYMMDD` format.
3. Debit and credit totals must match.
4. For ledger creation, `NAME` and `PARENT` are mandatory.
5. For voucher creation, `VOUCHERTYPENAME`, `DATE`, ledger entries, and amount balancing are important.
6. Tally response should be parsed to check `CREATED`, `ERRORS`, and `LINEERROR`.

Tally shows errors like `Voucher totals do not match!` when debit and credit amounts are not equal.

## Response XML Format

On import, Tally returns response counters:

![image.png](attachment:185bd75d-679f-4a3d-95d0-dd18df0f1e05:image.png)

Meaning:

```
CREATED → Number of records created
ALTERED → Number of records updated
ERRORS → Number of failed records
LASTVCHID → Last imported voucher ID
LINEERROR → Error message when something fails
```

Tally’s documentation lists these response fields for import data requests

## Step 4 : Testing XML Import in Tally

Test Ledger Creation XML in Postman

code :

```xml
<ENVELOPE>
	<HEADER>
		<TALLYREQUEST>Import Data</TALLYREQUEST>
	</HEADER>
	<BODY>
		<IMPORTDATA>
			<REQUESTDESC>
				<REPORTNAME>All Masters</REPORTNAME>
			</REQUESTDESC>
			<REQUESTDATA>
				<TALLYMESSAGE xmlns:UDF="TallyUDF">
					<LEDGER ACTION="Create">
						<NAME>FarmStack Customer ABC</NAME>
						<PARENT>Sundry Debtors</PARENT>
						<ISBILLWISEON>Yes</ISBILLWISEON>
						<OPENINGBALANCE>0</OPENINGBALANCE>
					</LEDGER>
				</TALLYMESSAGE>
			</REQUESTDATA>
		</IMPORTDATA>
	</BODY>
</ENVELOPE>
```

![image.png](attachment:176fd390-370f-4e9e-826d-5ee50666bad6:image.png)

Postman :

![image.png](attachment:5bc45bad-e57f-4bea-bf70-43a36c7ab343:image.png)

Tally response

![image.png](attachment:e50ea062-a36f-445b-b42d-790e16f417cb:image.png)

Ledger create with FarmStack Customer ABC

I tested ledger creation by sending XML from Postman to TallyPrime running on `http://localhost:9000`.

The request used `TALLYREQUEST = Import Data` and `REPORTNAME = All Masters`, because ledger is a master object in Tally.

The test ledger `FarmStack Customer ABC` was created under the `Sundry Debtors` group.

After sending the request, Tally returned response counters such as `CREATED`, `ALTERED`, and `ERRORS`.

A successful import is confirmed when `CREATED = 1` and `ERRORS = 0`.

The ledger was then verified manually inside TallyPrime under Chart of Accounts → Ledgers.

Test Sales Creation XML in Postman

code :

```xml
<ENVELOPE>
	<HEADER>
		<VERSION>1</VERSION>
		<TALLYREQUEST>Import</TALLYREQUEST>
		<TYPE>Data</TYPE>
		<ID>Vouchers</ID>
	</HEADER>
	<BODY>
		<DESC></DESC>
		<DATA>
			<TALLYMESSAGE>
				<VOUCHER>
					<DATE>20260401</DATE>
					<NARRATION>FarmStack test sales voucher</NARRATION>
					<VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
					<VOUCHERNUMBER>FS-SALE-002</VOUCHERNUMBER>
					<ALLLEDGERENTRIES.LIST>
						<LEDGERNAME>FarmStack Customer ABC</LEDGERNAME>
						<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
						<AMOUNT>-5000.00</AMOUNT>
					</ALLLEDGERENTRIES.LIST>
					<ALLLEDGERENTRIES.LIST>
						<LEDGERNAME>Sales</LEDGERNAME>
						<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
						<AMOUNT>5000.00</AMOUNT>
					</ALLLEDGERENTRIES.LIST>
				</VOUCHER>
			</TALLYMESSAGE>
		</DATA>
	</BODY>
</ENVELOPE>
```

![image.png](attachment:7e9e5185-c77c-4724-bf74-66e8ae9ffa58:image.png)

Postman :

![image.png](attachment:f4a6748f-66a2-4fed-a8fe-7a7c32f84754:image.png)

Tally response

![image.png](attachment:1f64ddfd-ac72-4277-89cf-37af98685271:image.png)

While testing Sales Voucher XML import, Tally returned:

`Voucher date is missing`

even though `<DATE>20260429</DATE>` was provided.

The issue was not the date format itself. The root causes were likely:

- Using a date outside the company’s configured financial year or books beginning date.
- Using unsupported or unnecessary XML tags.
- Using `LEDGERENTRIES.LIST` instead of `ALLLEDGERENTRIES.LIST`.

The issue was resolved by:

- Using a valid date within the financial year (`20260401`)
- Simplifying the XML structure
- Replacing `LEDGERENTRIES.LIST` with `ALLLEDGERENTRIES.LIST`

After correction, the Sales Voucher was successfully created in TallyPrime.

Test Purchase Creation XML in Postman

code :

```xml
<ENVELOPE>
	<HEADER>
		<VERSION>1</VERSION>
		<TALLYREQUEST>Import</TALLYREQUEST>
		<TYPE>Data</TYPE>
		<ID>Vouchers</ID>
	</HEADER>
	<BODY>
		<DESC></DESC>
		<DATA>
			<TALLYMESSAGE>
				<VOUCHER>
					<DATE>20260401</DATE>
					<NARRATION>FarmStack test purchase voucher</NARRATION>
					<VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
					<VOUCHERNUMBER>FS-PUR-001</VOUCHERNUMBER>
					<ALLLEDGERENTRIES.LIST>
						<LEDGERNAME>Purchase</LEDGERNAME>
						<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
						<AMOUNT>-3000.00</AMOUNT>
					</ALLLEDGERENTRIES.LIST>
					<ALLLEDGERENTRIES.LIST>
						<LEDGERNAME>FarmStack Farmer Ramesh</LEDGERNAME>
						<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
						<AMOUNT>3000.00</AMOUNT>
					</ALLLEDGERENTRIES.LIST>
				</VOUCHER>
			</TALLYMESSAGE>
		</DATA>
	</BODY>
</ENVELOPE>
```

![image.png](attachment:f4835f2f-5090-4849-8435-4b8df4902cb8:image.png)

![image.png](attachment:d5566654-24a4-4f50-9497-339780e84c29:image.png)

Postman :

![image.png](attachment:944e8bc0-02bb-4351-af38-9d753cf50d9b:image.png)

Tally

![image.png](attachment:4096e6e7-656a-4bac-b668-e3c37eba9461:image.png)

# Tally Response XML Format

When XML is posted to TallyPrime through `http://localhost:9000`, Tally returns an XML response. This response tells whether the import was successful, updated an existing record, failed, or had validation exceptions.

Tally response must always be checked before marking any FarmStack sync as successful.

## 1. Successful Creation Response

When a new ledger or voucher is created successfully, Tally returns `CREATED = 1`.

![image.png](attachment:6f483be2-64b2-4433-95cd-3afb81e82cec:image.png)

CREATED = 1      → New record created successfully
ERRORS = 0       → No import error
EXCEPTIONS = 0   → No validation exception
LASTVCHID        → Internal Tally voucher ID, if voucher was created

## 2. Successful Altered Response

If the same master already exists, Tally may update or alter it instead of creating a new one.

Example from our Purchase ledger test:

![image.png](attachment:779f6c7a-29de-4e94-955d-b0dea017a52e:image.png)

CREATED = 0      → No new record created
ALTERED = 1      → Existing record updated/altered
ERRORS = 0       → No error
EXCEPTIONS = 0   → No exception

## 3. Error / Exception Response

If Tally cannot import the XML due to missing ledger, invalid structure, wrong amount balance, or invalid data, it returns `LINEERROR` and usually `EXCEPTIONS = 1`.

![image.png](attachment:96e43949-416f-48d9-85a6-f351c2bfc2bf:image.png)

LINEERROR       → Actual reason for failure
CREATED = 0     → Nothing created
ALTERED = 0     → Nothing updated
EXCEPTIONS = 1  → Tally rejected the import due to validation issue

## 4. Important Response Fields

| Field | Meaning |
| --- | --- |
| `CREATED` | Number of new records created in Tally |
| `ALTERED` | Number of existing records updated/altered |
| `DELETED` | Number of records deleted |
| `LASTVCHID` | Last created voucher ID inside Tally |
| `LASTMID` | Last master ID inside Tally |
| `COMBINED` | Number of combined records |
| `IGNORED` | Records ignored by Tally |
| `ERRORS` | Import-level errors |
| `CANCELLED` | Cancelled records |
| `EXCEPTIONS` | Validation/business-rule exceptions |
| `LINEERROR` | Human-readable error message |