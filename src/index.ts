import { BaleUpdate, SendMessageParams } from './types';

interface Env {
	BOT_TOKEN: string;
	WEBHOOK_SECRET: string;
}

class BaleBot {
	private baseUrl: string;

	constructor(private token: string) {
		this.baseUrl = `https://tapi.bale.ai/bot${token}`;
	}

	async sendMessage(params: SendMessageParams): Promise<Response> {
		const response = await fetch(`${this.baseUrl}/sendMessage`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(params),
		});

		return response;
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = new BaleBot(env.BOT_TOKEN);

		// Handle webhook verification
		if (request.method === 'GET') {
			const url = new URL(request.url);
			const token = url.searchParams.get('secret_token');

			if (token === env.WEBHOOK_SECRET) {
				return new Response('Webhook verified', { status: 200 });
			}
			return new Response('Unauthorized', { status: 401 });
		}

		// Handle incoming updates
		if (request.method === 'POST') {
			try {
				const update: BaleUpdate = await request.json();

				if (update.message?.text) {
					const message = update.message;
					const chatId = message.chat.id;
					const text = message.text;

					// Handle commands
					if (text && text.startsWith('/')) {
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
										'Available commands:\n' +
										'/start - Start the bot\n' +
										'/help - Show this help message\n' +
										'/time - Show current time\n' +
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
						// Handle regular messages
						await bot.sendMessage({
							chat_id: chatId,
							text: 'Please use commands to interact with me. Type /help to see available commands.',
						});
					}
				}

				return new Response('OK', { status: 200 });
			} catch (error) {
				console.error('Error processing update:', error);
				return new Response('Error processing update', { status: 500 });
			}
		}

		return new Response('Method not allowed', { status: 405 });
	},
};
