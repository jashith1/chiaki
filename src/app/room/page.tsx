'use client';
import { useCookies } from 'next-client-cookies';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import socket from '../../socket/socket';

export default function App() {
	const cookies = useCookies();
	const roomCode = cookies.get('roomCode');
	const router = useRouter();
	const [roomDetails, setRoomDetails] = useState({ participants: [] });

	useEffect(() => {
		socket.connect();
		socket.emit('roomDetails', roomCode, (res: any) => {
			setRoomDetails(res);
		});
	});

	if (!roomCode) router.push('/');

	return (
		<>
			<h1>roomCode: {roomCode}</h1>
			<h1>participants:</h1>
			<ul>
				{roomDetails?.participants?.map((participant: any, index: number) => (
					<li key={index}>{participant.username}</li>
				))}
			</ul>
		</>
	);
}
