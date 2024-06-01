'use client';
import { FormEventHandler, useEffect, useState } from 'react';
import socket from '../socket/socket';
import { useRouter } from 'next/navigation';
import { useCookies } from 'next-client-cookies';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

export default function Page() {
	const [isConnected, setIsConnected] = useState(false);
	const router = useRouter();
	const cookies = useCookies();
	const [username, setUserName] = useState(cookies.get('username'));
	const style = {
		position: 'absolute' as 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 400,
		border: '2px solid #000',
		boxShadow: 24,
		p: 4,
	};

	function createRoom() {
		socket.emit('createRoom', username, (code: string) => {
			cookies.set('roomCode', code);
			router.push('/room');
		});
	}

	function joinRoom(e: any) {
		e.preventDefault();
		const roomCode = e.target['roomCode'].value;
		socket.emit('joinRoom', username, roomCode, (success: boolean) => {
			if (!success) return;
			cookies.set('roomCode', roomCode);
			router.push('/room');
		});
	}

	function handleUsername(e: any) {
		e.preventDefault();
		const username = e.target['username'].value;
		cookies.set('username', username);
		setUserName(username);
	}

	useEffect(() => {
		socket.connect();
		setIsConnected(socket.connected);
	}, []);

	return (
		<>
			<Modal open={!username} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
				<Box sx={style}>
					<form onSubmit={handleUsername}>
						<input type="text" name="username" className="text-black" placeholder="username" />
						<button type="submit">set username</button>
					</form>
				</Box>
			</Modal>
			<h1>Currently {isConnected ? 'connected' : 'disconnected'}</h1>
			<button onClick={createRoom}>Create Room</button>
			<br />
			<form onSubmit={joinRoom}>
				<input type="text" name="roomCode" className="text-black" placeholder="roomCode" />
				<button type="submit">Join Room</button>
			</form>
		</>
	);
}
