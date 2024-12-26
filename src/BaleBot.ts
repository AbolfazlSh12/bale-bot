import axios from 'axios';
import { Env } from './Env';
import { BaleMessage, SendMessageParams } from './types';
import { INSERT_GROUP, INSERT_MESSAGE, INSERT_USER } from './database/queries';

export class BaleBot {
	private baseUrl: string;

	constructor(private token: string) {
		this.baseUrl = `https://tapi.bale.ai/bot${token}`;
	}

	async sendMessage(params: SendMessageParams): Promise<Response> {
		try {
			const response = await axios.post(`${this.baseUrl}/sendMessage`, params, {
				headers: { 'Content-Type': 'application/json' },
			});

			return new Response(JSON.stringify(response.data), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error: any) {
			console.error('Error sending message:', error);
			return new Response(JSON.stringify({ error: error.message }), {
				status: error.response?.status || 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	async storeMessage(env: Env, message: BaleMessage): Promise<void> {
		const { DB } = env;

		try {
			const queries = [];

			// Prepare the query for inserting or updating the group
			if (message.chat) {
				queries.push(
					DB.prepare(INSERT_GROUP).bind(message.chat.id, message.chat.title || '', message.chat.type, message.chat.username || null)
				);
			}

			// Prepare the query for inserting or updating the user
			if (message.from) {
				queries.push(
					DB.prepare(INSERT_USER).bind(
						message.from.id,
						message.from.username || null,
						message.from.first_name,
						message.from.last_name || null
					)
				);
			}

			// Prepare the query for inserting the message
			queries.push(
				DB.prepare(INSERT_MESSAGE).bind(
					message.message_id,
					message.chat.id,
					message.from?.id || null,
					message.text || null,
					message.date, // This is the timestamp
					message.reply_to_message?.message_id || null
				)
			);

			// Execute all queries in a batch
			await DB.batch(queries);
		} catch (error) {
			console.error('Error storing message:', error);
			throw error;
		}
	}

	// Method to get messages from a group
	async getGroupMessages(env: Env, chat_id: number, limit = 50, offset = 0, startDate?: string, endDate?: string): Promise<Response> {
		try {
			let query = `
        SELECT
          m.message_id,
          m.chat_id,
          g.title as chat_title,
          m.user_id,
          u.username as user_name,
          m.text,
          m.timestamp,
          m.reply_to_message_id
        FROM messages m
        JOIN groups g ON m.chat_id = g.chat_id
        LEFT JOIN users u ON m.user_id = u.user_id
        WHERE m.chat_id = ?
      `;

			const params: any[] = [chat_id];

			if (startDate || endDate) {
				if (startDate) {
					query += ` AND m.timestamp >= ?`;
					params.push(Math.floor(new Date(startDate).getTime() / 1000));
				}
				if (endDate) {
					query += ` AND m.timestamp <= ?`;
					params.push(Math.floor(new Date(endDate).getTime() / 1000));
				}
			}

			query += ` ORDER BY m.timestamp DESC LIMIT ? OFFSET ?`;
			params.push(limit, offset);

			const messages = await env.DB.prepare(query)
				.bind(...params)
				.all();

			const results = messages.results || [];
			return new Response(
				JSON.stringify({
					messages: results,
					total: results.length,
					hasMore: results.length === limit,
				}),
				{
					headers: { 'Content-Type': 'application/json' },
				}
			);
		} catch (error) {
			console.error('Error retrieving messages:', error);
			return new Response(JSON.stringify({ error: 'Failed to retrieve messages' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}
