# Contact Identifier Service

This project is a web service for identifying and consolidating contacts based on provided email and phone number. It can handle cases where contacts may overlap and need to be linked or converted from primary to secondary.

## Hosted Service

The service is hosted at: [https://contact-identifier-yu5a.onrender.com](https://contact-identifier-yu5a.onrender.com)

## Endpoints

### Identify Contact

**Endpoint:** `/identify`

**Method:** `POST`

**Description:** This endpoint identifies and consolidates contact information based on the provided email and phone number. If the contact information overlaps with existing contacts, it links them appropriately.

**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string"
}
```
**Response Body:**

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
```

**Find All Contacts**

Endpoint: `/find_contacts`

Method: `GET`

Description: This endpoint retrieves all contacts stored in the database.

**Response:**

```json
[
  {
    "id": number,
    "email": "string",
    "phoneNumber": "string",
    "linkedId": number,
    "linkPrecedence": "string",
    "createdAt": "date-time",
    "updatedAt": "date-time",
    "deletedAt": "date-time"
  }
]
```

### Features
- Contact Identification: The service identifies contacts based on provided email and phone number inputs.
- Primary Contact Creation: If no existing contacts are found, the service creates a new primary contact.
- Linking Contacts: It links primary and secondary contacts to ensure proper organization and retrieval.

### Installation
To run the Contact Identification Service locally, follow these steps:

1) Clone the repository to your local machine:

```bash
git clone https://github.com/niketjain1/fluxkart-contact-management.git
```

2) Install dependencies:

```bash
cd fluxkart-contact-management
npm install
```

3) Set up the required environment variables.
- Set up db configuration in the .env file. {This is to be done locally}

4) Start the service:
```bash
npm start
```

### Usage
To use the Contact Identification Service, send HTTP requests to the appropriate endpoints. Here's an example using cURL:

Testing locally -
```bash
curl --location 'http://localhost:3000/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "kjklj@gmail.com",
    "phoneNumber": "123554"
}
'
```

Testing on production - 
```bash
curl --location 'https://contact-identifier-yu5a.onrender.com/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "example@example.com",
    "phoneNumber": "123453236"
}
'
```

### Tech Stack Used
- Node.js: JavaScript runtime for building scalable network applications.
- NestJS: A progressive Node.js framework for building efficient and reliable server-side applications.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
- TypeORM: An ORM for TypeScript and JavaScript (ES7, ES6, ES5).
- PostgreSQL: A powerful, open-source object-relational database system.
- Render: A unified cloud platform to build and run all your apps and websites with free SSL, a global CDN, private networks, and auto-deploys from Git.