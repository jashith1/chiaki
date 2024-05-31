'use client';
import { useCookies } from 'next-client-cookies';

export default function App() {
	const cookies = useCookies();

	return (
		<>
			<h1>roomCode: {cookies.get('roomCode')}</h1>
		</>
	);
}
