import { Env } from '../Env';
import { BaleBot } from '../BaleBot';

export const handleGetMessages = (url: URL, bot: BaleBot, env: Env) => {
	const chatId = parseInt(url.searchParams.get('chatId') || '');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const startDate = url.searchParams.get('startDate') || undefined;
	const endDate = url.searchParams.get('endDate') || undefined;

	if (isNaN(chatId)) {
		return new Response(JSON.stringify({ error: 'Invalid chat ID' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return bot.getGroupMessages(env, chatId, limit, offset, startDate, endDate);
};
