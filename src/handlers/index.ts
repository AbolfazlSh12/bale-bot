import { Env } from "../Env";
import { BaleBot } from "../BaleBot";
import { BaleUpdate } from "../types";
import { handleGetMessages } from "./handleGetMessage";
import { handleGroupMessage } from "./handleGroupMessage";
import { handlePrivateMessage } from "./handlePrivateMessage";

export const handleRequest = async (request: Request, env: Env): Promise<Response> => {
	const bot = new BaleBot(env.BOT_TOKEN);
	const url = new URL(request.url);

	if (request.method === 'GET' && url.pathname === '/messages') {
		return handleGetMessages(url, bot, env);
	}

	if (request.method === 'POST') {
		try {
			const update: BaleUpdate = await request.json();

			if (update.message) {
				const message = update.message;
				const chat = message.chat;

				if (chat.type === 'group' || chat.type === 'supergroup') {
					await handleGroupMessage(bot, env, message);
				} else {
					await handlePrivateMessage(message, bot, env);
				}
			}

			return new Response('OK', { status: 200 });
		} catch (error) {
			console.error('Error processing update:', error);
			return new Response('Error processing update', { status: 500 });
		}
	}

	return new Response('Method not allowed', { status: 405 });
};
