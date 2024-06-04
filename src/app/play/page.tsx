'use client';
import { useCookies } from 'next-client-cookies';
import socket from '@/socket/socket';
import { useEffect, useState } from 'react';

export default function App() {
	const cookies = useCookies();
	const roomCode = cookies.get('roomCode');
	const username = cookies.get('username');
	const [question, setQuestion] = useState<any>();
	const [roomDetails, setRoomDetails] = useState<any>({ participants: [] });
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		socket.connect();
		socket.emit('question', roomCode);
		socket.emit('roomDetails', roomCode, (res: any) => {
			setRoomDetails(res);
		});
		socket.on('question', (newQuestion) => {
			setSubmitted(false);
			setQuestion(newQuestion);
		});
	}, []);

	function handleOptionSelect(index: number) {
		if (submitted) return;
		setSubmitted(true);
		socket.emit('answer', roomCode, username, index, () => {
			socket.emit('question', roomCode);
			socket.emit('roomDetails', roomCode, (res: any) => {
				setRoomDetails(res);
			});
		});
	}

	return (
		<>
			<h1>{question?.question}</h1>
			<ul>
				{question?.options?.map((option: any, index: number) => (
					<li key={index} onClick={() => handleOptionSelect(index)}>
						{option}
					</li>
				))}
			</ul>
			<br />
			<ul>
				{roomDetails?.participants?.map((participant: any, index: number) => (
					<li key={index}>
						{participant.username}: {participant.score}
					</li>
				))}
			</ul>
		</>
	);
}
