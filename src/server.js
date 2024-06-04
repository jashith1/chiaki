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
	return { question: '1+2 = ', options: ['1', '2', '3', '4'], answer: 2 };
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
			if (rooms[roomCode].answer === index) rooms[roomCode][username].score++;
			callback();
		});

		socket.on('joinRoom', (username, roomCode, callback) => {
			if (!rooms[roomCode] || rooms[roomCode][username]) callback(false);
			socket.join(roomCode);
			rooms[roomCode].participants.push({ username, score: 0 });
			rooms[roomCode][username] = rooms[roomCode].participants[rooms[roomCode].participants.length - 1];
			callback(true);
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
