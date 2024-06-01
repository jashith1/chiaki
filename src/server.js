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
			rooms[code] = { participants: [{ username, leader: true }] };
			callback(code);
			console.log(rooms);
		});

		socket.on('joinRoom', (username, roomCode, callback) => {
			if (!rooms[roomCode]) callback(false);
			rooms[roomCode].participants.push({ username });
			callback(true);
		});

		socket.on('roomDetails', (roomCode, callback) => {
			callback(rooms[roomCode]);
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
