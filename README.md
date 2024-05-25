### Contact Identification Service
This repository contains a Node.js service for identifying contacts based on email and phone number inputs.

### Overview
The Contact Identification Service is designed to fetch contacts from a database, create new primary contacts if necessary, and provide information about identified contacts.

### Features
- Contact Identification: The service identifies contacts based on provided email and phone number inputs.
- Primary Contact Creation: If no existing contacts are found, the service creates a new primary contact.
- Linking Contacts: It links primary and secondary contacts to ensure proper organization and retrieval.

### Installation
To run the Contact Identification Service locally, follow these steps:

1) Clone the repository to your local machine:

```bash
Copy code
git clone https://github.com/your-username/contact-identification-service.git
```

2) Install dependencies:

```bash
Copy code
cd contact-identification-service
npm install
```

3) Set up the required environment variables.

4) Start the service:
```bash
npm start
```

### Usage
To use the Contact Identification Service, send HTTP requests to the appropriate endpoints. Here's an example using cURL:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email": "example@example.com", "phoneNumber": "1234567890"}' http://localhost:3000/identify
```

### Tech stack used
- NestJs
- TypeORM
- Postgres