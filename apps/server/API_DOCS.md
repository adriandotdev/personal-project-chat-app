# API Documentation

This document describes the REST API endpoints for the Daily Bytes Chat Application backend.

---

## Authentication

### POST `/api/v1/auth/signup`

- **Description:** Register a new user.
- **Request Body:**
  - `name` (string, required)
  - `username` (string, required, min 8 chars, unique)
  - `password` (string, required, min 8 chars)
  - `email` (string, required, unique)
- **Responses:**
  - `201 Created`: Successfully registered
    - `{ message: "Successfully registered" }`
  - `400 Bad Request`: Username or email exists
    - `{ message: "Username exists" }` or `{ message: "Email exists" }`

---

### POST `/api/v1/auth/login`

- **Description:** Authenticate a user and receive a JWT token.
- **Request Body:**
  - `username` (string, required)
  - `password` (string, required)
- **Responses:**
  - `200 OK`: Login successful
    - `{ userId: number, accessToken: string }`
  - `401 Unauthorized`: Invalid credentials
    - `{ message: "Invalid credentials" }`

---

## Users

### GET `/api/v1/users`

- `Authorization: Bearer <JWT>`
- `200 OK`: Success
  - `{ data: [ { name, username, id, conversationId|null } ], message: "Successfully retrieved" }`
- `401 Unauthorized`: Missing or invalid token

### GET `/api/v1/users/profile`

- **Description:** Get the profile of the currently logged-in user.
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Responses:**
  - `200 OK`: Success
    - `{ data: { id, name, email, username, createdAt, password, mobileNumber }, message: "Profile retrieved" }`
  - `404 Not Found`: User not found
    - `{ message: "User not found" }`
  - `500 Internal Server Error`: Failed to retrieve profile
    - `{ message: "Failed to retrieve profile", error: string }`

---

## Chats

### GET `/api/v1/chats`

- **Description:** Get all conversations for the logged-in user, with latest message and participants.
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Responses:**
  - `200 OK`: Success
    - `{ success: true, message: "Succesfully retrieved chat list", data: { chats: [...], participants: [...] } }`
  - `401 Unauthorized`: Missing or invalid token

#### Chat Object Example

```
{
  conversationId: number,
  conversationName: string,
  messageId: number,
  content: string,
  senderId: number,
  createdAt: string,
  isConversationGroup: boolean
}
```

#### Participant Object Example

```
{
  id: number,
  name: string,
  username: string,
  conversationId: number
}
```

---

### GET `/api/v1/chats/messages/:conversationId`

- **Description:** Get all messages for a conversation.
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Params:**
  - `conversationId` (number, required)
- **Responses:**
  - `200 OK`: Success
    - `{ data: [ { messageId, conversationId, content, senderId, senderName } ] }`
  - `401 Unauthorized`: Missing or invalid token

---

## Authentication

All endpoints (except `/auth/signup` and `/auth/login`) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Error Responses

- `401 Unauthorized`: Returned if the JWT is missing or invalid.
- `400 Bad Request`: Returned for validation errors or duplicate entries.

## Data Models

### User

- `id`: integer
- `name`: string
- `username`: string
- `email`: string
- `password`: string (hashed)
- `createdAt`: timestamp

### Conversation

- `id`: integer
- `isGroup`: boolean
- `name`: string
- `createdAt`: timestamp
- `lastMessageId`: integer

### Message

- `id`: integer
- `conversationId`: integer
- `senderId`: integer
- `content`: string
- `createdAt`: timestamp

### ConversationParticipant

- `conversationId`: integer
- `userId`: integer
- `joinedAt`: timestamp

---

## Notes

- All timestamps are ISO 8601 strings.
- All endpoints return JSON responses.
- Use HTTPS in production for secure communication.

---

# Socket.IO Server Documentation

The chat application uses Socket.IO for real-time messaging. Below are the main events and their payloads.

## Connection

- **Client connects:**
  - Query param: `userId` (required)
  - Joins room: `user_<userId>`

---

## Events

### send_message

- **Description:** Send a message to a conversation.
- **Payload:**
  - `conversationId` (number, required)
  - `message` (string, required)
- **Server Actions:**
  - Inserts message into DB
  - Updates conversation's lastMessageId
  - Emits `chat_list_update` to all participants except sender
  - Emits `receive_message` to conversation room with updated messages

---

### join_conversation

- **Description:** Join a conversation room.
- **Payload:**
  - `conversationId` (number, required)
- **Server Actions:**
  - Joins socket to room `conversationId`

---

### create_conversation

- **Description:** Create a new conversation (DM or group).
- **Payload:**
  - `participantIds` (array of numbers, required)
  - `creatorId` (number, required)
- **Server Actions:**
  - Checks for existing conversation
  - Creates new conversation if not found
  - Adds participants
  - Joins socket to room `cv_<conversationId>`
  - Emits `new_conversation` to all participants

---

### new_conversation

- **Description:** Notification for new conversation.
- **Payload:**
  - `conversationId` (number)

---

### start_typing

- **Description:** Notify others that user started typing.
- **Payload:**
  - `conversationId` (number)
- **Server Actions:**
  - Emits `start_typing` to conversation room

---

### end_typing

- **Description:** Notify others that user stopped typing.
- **Payload:**
  - `conversationId` (number)
- **Server Actions:**
  - Emits `end_typing` to conversation room

---

## Server Emitted Events

### receive_message

- **Description:** Sent to conversation room when a new message is sent.
- **Payload:**
  - Array of message objects:
    - `messageId`, `content`, `senderId`, `conversationId`, `senderName`

### chat_list_update

- **Description:** Sent to user rooms when chat list needs to be updated.
- **Payload:**
  - `conversationId` (number)

### new_conversation

- **Description:** Sent to user rooms when a new conversation is created.
- **Payload:**
  - `conversationId` (number)

### start_typing / end_typing

- **Description:** Typing indicator events sent to conversation room.

---

## Notes

- All events use JSON payloads.
- Rooms are named as `user_<userId>` for user notifications and `<conversationId>` or `cv_<conversationId>` for conversation rooms.
- Use the `userId` query parameter when connecting to associate the socket with a user.
- All database operations are performed before emitting events.
