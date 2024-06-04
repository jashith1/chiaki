import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

function getQuestion() {
	let num1 = Math.floor(Math.random() * 10);
	let num2 = Math.floor(Math.random() * 10);
	let ans = num1 + num2;
	let index;
	let options = [];
	for (let i = 0; i < 4; i++) {
		const shouldInclude = Math.random() < 0.25 * (i + 1) && !index;
		if (shouldInclude) index = i;
		options.push(shouldInclude ? ans : Math.floor(Math.random() * 20));
	}
	return { question: `${num1} + ${num2} = `, options, answer: index };
}

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);

	const rooms = {};

	io.on('connection', (socket) => {
		socket.on('disconnect', () => {
			console.log('client disconnected');
		});
		socket.on('createRoom', (username, callback) => {
			console.log('creating room');
			const roomCode = uuidv4();
			socket.join(roomCode);
			rooms[roomCode] = { participants: [{ username, score: 0 }], leader: username, ready: 0 };
			rooms[roomCode][username] = rooms[roomCode].participants[rooms[roomCode].participants.length - 1];
			callback(roomCode);
		});

		socket.on('question', (roomCode, callback) => {
			rooms[roomCode].ready++;
			if (rooms[roomCode].ready === rooms[roomCode].participants.length) {
				rooms[roomCode].question = getQuestion();
				rooms[roomCode].ready = 0;
				console.log(rooms[roomCode]);
				io.to(roomCode).emit('question', rooms[roomCode].question);
			}
		});

		socket.on('answer', (roomCode, username, index, callback) => {
			if (rooms[roomCode].question.answer === index) rooms[roomCode][username].score++;
			callback();
			console.log(rooms[roomCode]);
		});

		socket.on('joinRoom', (username, roomCode, callback) => {
			if (!rooms[roomCode] || rooms[roomCode][username]) callback(false);
			socket.join(roomCode);
			rooms[roomCode].participants.push({ username, score: 0 });
			rooms[roomCode][username] = rooms[roomCode].participants[rooms[roomCode].participants.length - 1];
			callback(true);
			io.to(roomCode).emit('newParticipant');
		});

		socket.on('roomDetails', (roomCode, callback) => {
			callback(rooms[roomCode]);
		});

		socket.on('startGame', (roomCode) => {
			io.to(roomCode).emit('startGame');
		});
		console.log('client connected');
	});

	httpServer
		.once('error', (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`BANZAI`);
		});
});
