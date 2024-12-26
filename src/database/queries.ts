export const INSERT_GROUP = `
INSERT INTO groups (chat_id, title, type, username)
VALUES (?, ?, ?, ?)
ON CONFLICT(chat_id) DO UPDATE SET
title = excluded.title,
type = excluded.type,
username = excluded.username
`;

export const INSERT_USER = `
INSERT INTO users (user_id, username, first_name, last_name)
VALUES (?, ?, ?, ?)
ON CONFLICT(user_id) DO UPDATE SET
username = excluded.username,
first_name = excluded.first_name,
last_name = excluded.last_name
`;

export const INSERT_MESSAGE = `
INSERT INTO messages (message_id, chat_id, user_id, text, timestamp, reply_to_message_id)
VALUES (?, ?, ?, ?, ?, ?)
`;
