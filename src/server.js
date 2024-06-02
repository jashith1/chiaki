import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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
			const code = uuidv4();
			socket.join(code);
			rooms[code] = { participants: [{ username, score: 0 }], leader: username, ready: 0 };
			callback(code);
		});

		socket.on('ready', (roomCode, callback) => {
			if (rooms[roomCode].ready === 0) {
				rooms[roomCode].question = { question: '1+2 = ', options: ['1', '2', '3', '4'] };
				rooms[roomCode].answer = 2;
			}
			callback(rooms[roomCode].question);
			rooms[roomCode].ready++;
			if (rooms[roomCode].ready === rooms[roomCode].participants.length) {
				io.to(roomCode).emit('startQuestion');
			}
		});

		socket.on('joinRoom', (username, roomCode, callback) => {
			if (!rooms[roomCode]) callback(false);
			socket.join(roomCode);
			rooms[roomCode].participants.push({ username });
			callback(true);
		});

		socket.on('roomDetails', (roomCode, callback) => {
			callback(rooms[roomCode]);
		});

		socket.on('startQuiz', (roomCode) => {
			io.to(roomCode).emit('startQuiz');
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
