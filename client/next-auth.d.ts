import NextAuth from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			name?: string | null
			email?: string | null
			image?: string | null
			verificationLevel?: string
		}
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		verificationLevel?: string
	}
}
