'use client';
import { FormEventHandler, useEffect, useState } from 'react';
import socket from '../socket/socket';
import { useRouter } from 'next/navigation';
import { useCookies } from 'next-client-cookies';

export default function Page() {
	const [isConnected, setIsConnected] = useState(false);
	const router = useRouter();
	const cookies = useCookies();

	function createRoom(e: any) {
		e.preventDefault();
		const username = e.target['userName'].value;
		socket.emit('createRoom', username, (code: string) => {
			cookies.set('roomCode', code);
			router.push('/room');
		});
	}

	function joinRoom(e: any) {
		e.preventDefault();
		const username = e.target['userName'].value;
		const roomCode = e.target['roomCode'].value;
		socket.emit('joinRoom', username, roomCode, (success: boolean) => {
			if (!success) return;
			cookies.set('roomCode', roomCode);
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
			<form onSubmit={createRoom}>
				<input type="text" name="userName" className="text-black" placeholder="username" />
				<button type="submit">Create Room</button>
			</form>
			<br />
			<form onSubmit={joinRoom}>
				<input type="text" name="userName" className="text-black" placeholder="username" />
				<input type="text" name="roomCode" className="text-black" placeholder="roomCode" />
				<button type="submit">Join Room</button>
			</form>
		</>
	);
}
