export interface BaleUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
}

export interface BaleChat {
	id: number;
	type: 'private' | 'group' | 'supergroup' | 'channel';
	title?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
}

export interface BaleMessage {
	message_id: number;
	from?: BaleUser;
	chat: BaleChat;
	date: number;
	text?: string;
	reply_to_message?: BaleMessage;
}

export interface BaleUpdate {
	update_id: number;
	message?: BaleMessage;
	edited_message?: BaleMessage;
}

export interface SendMessageParams {
	chat_id: number;
	text: string;
	parse_mode?: 'HTML' | 'Markdown';
	disable_web_page_preview?: boolean;
	disable_notification?: boolean;
	reply_to_message_id?: number;
}
