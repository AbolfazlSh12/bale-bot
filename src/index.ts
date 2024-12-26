import { Env } from './Env';
import { handleRequest } from './handlers';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request, env);
	},
};
