'use client';
import { useCookies } from 'next-client-cookies';
import socket from '@/socket/socket';
import { useEffect, useState } from 'react';

export default function App() {
	const cookies = useCookies();
	const roomCode = cookies.get('roomCode');
	const [question, setQuestion] = useState<any>();

	useEffect(() => {
		socket.connect();
		socket.emit('ready', roomCode, (res: any) => {
			console.log('callback' + res);
			setQuestion(res);
		});
	});

	return (
		<>
			<h1>{question?.question}</h1>
			<ul>
				{question?.options?.map((option: any, index: number) => (
					<li key={index}>{option}</li>
				))}
			</ul>
		</>
	);
}
