import { Env } from "../Env";
import { BaleBot } from "../BaleBot";
import { BaleMessage } from "../types";

export const handleGroupMessage = async (bot: BaleBot, env: Env, message: BaleMessage) => {
	// Store message in D1
	await bot.storeMessage(env, message);

	// Handle commands
	if (message.text?.startsWith('/')) {
		const [command] = message.text.split(' ');
		const chatId = message.chat.id;

		switch (command) {
			case '/stats': {
				const stats = await env.DB.prepare(`SELECT COUNT(*) as count FROM messages WHERE chat_id = ?`).bind(chatId).first();

				await bot.sendMessage({
					chat_id: chatId,
					text: `📊 Group Statistics:\nTotal Messages: ${stats?.count}`,
				});
				break;
			}

			case '/help':
				await bot.sendMessage({
					chat_id: chatId,
					text: '🤖 Available Commands:\n/stats - Show group statistics\n/help - Show this help message',
				});
				break;
		}
	}
};
