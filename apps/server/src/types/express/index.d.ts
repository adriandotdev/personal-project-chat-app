export {};

export type Token = {
	id: number;
	aud: string;
	iss: string;
	sub: string;
};
declare global {
	namespace Express {
		export interface Request {
			token: Token;
		}
	}
}
