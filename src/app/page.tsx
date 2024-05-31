'use client';
import { useEffect, useState } from 'react';
import socket from '../socket/socket';
import joinRoom from '../socket/joinRoom';
import { useRouter } from 'next/navigation';
import { useCookies } from 'next-client-cookies';

export default function Page() {
	const [isConnected, setIsConnected] = useState(false);
	const router = useRouter();
	const cookies = useCookies();

	function createRoom() {
		socket.emit('createRoom', 'example', (code: string) => {
			cookies.set('roomCode', code);
			router.push('/room');
		});
	}

	useEffect(() => {
		socket.connect();
		setIsConnected(socket.connected);
	}, []);

	return (
		<>
			<h1>Currently {isConnected ? 'connected' : 'disconnected'}</h1>
			<button onClick={createRoom}>create room</button>
			<br />
			<button onClick={joinRoom}>join room</button>
		</>
	);
}
