import { Env } from '../Env';
import { BaleBot } from '../BaleBot';
import { BaleMessage } from '../types';

export const handlePrivateMessage = async (message: BaleMessage, bot: BaleBot, env: Env) => {
	const chatId = message.chat.id;
	const text = message.text;

	// Handle commands
	if (text) {
		if (text.startsWith('/')) {
			const [command, ...args] = text.split(' ');
			const commandName = command.substring(1);

			switch (commandName) {
				case 'start':
					await bot.sendMessage({
						chat_id: chatId,
						text: 'Welcome! Use /help to see available commands.',
					});
					break;

				case 'help':
					await bot.sendMessage({
						chat_id: chatId,
						text:
							'🤖 Available Commands:\n' +
							'/start - Start the bot\n' +
							'/help - Show this help message\n' +
							'/time - Show current time\n' +
							'/messages - Get group messages\n' +
							'/echo [text] - Echo back your message',
					});
					break;

				case 'time':
					const time = new Date().toLocaleString();
					await bot.sendMessage({
						chat_id: chatId,
						text: `Current time: ${time}`,
					});
					break;

				case 'messages':
					const groupMessages = await bot.getGroupMessages(env, 5746250874);
					const responseBody = await groupMessages.text();
					// console.log('messages:', JSON.parse(responseBody))E

					await bot.sendMessage({
						chat_id: chatId,
						text: 'Group messages successfully logged.',
					});
					break;

				case 'echo':
					const echoText = args.join(' ');
					await bot.sendMessage({
						chat_id: chatId,
						text: echoText || 'Please provide text to echo!',
					});
					break;

				default:
					await bot.sendMessage({
						chat_id: chatId,
						text: 'Unknown command. Use /help to see available commands.',
					});
			}
		} else {
			console.log('User message: ', text);
		}
	} else {
		// Handle regular messages
		await bot.sendMessage({
			chat_id: chatId,
			text: 'Please use commands to interact with me. Type /help to see available commands.',
		});
	}
};
