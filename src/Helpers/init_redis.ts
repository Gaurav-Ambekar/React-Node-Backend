import redis from 'redis';
const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1',
});
client.on('message', (err, data) => {
  console.error(err);
  console.log(data);
});
