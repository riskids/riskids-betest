# BE Test Riski Dwi Sabariyanto

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone this repository
2. Create `.env` file (see Environment Variables below)
3. Run the application with Docker

### Environment Variables

Create a `.env` file with these variables (or use defaults from docker-compose.yml):

```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://root:example@mongo:27017/db__betest?authSource=admin
REDIS_URL=redis://redis:6379
```

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Services

| Service  | Port  | Container Name | Description          |
|----------|-------|----------------|----------------------|
| App      | 3000  | ms--betest     | Node.js application  |
| MongoDB  | 27017 | db__betest     | Database service     |
| Redis    | 6379  | redis-betest   | Caching service      |

## API Documentation

After starting the services, access the API documentation at:

http://ms-betest-f632ba39b607.herokuapp.com/api-docs/

## Testing

To run tests:

```bash
# Run tests inside the container
docker-compose exec app npm test

# Or run tests locally (requires Node.js)
npm install
npm test
```

## Development

For development with hot-reload:

```bash
docker-compose up -d
docker-compose exec app npm run dev
```

## Data Persistence

- MongoDB data is persisted in a Docker volume (`mongodb_data`)
- Redis data is persisted in a Docker volume (`redis_data`)

## Cleanup

To stop and remove all containers and volumes:

```bash
docker-compose down -v
