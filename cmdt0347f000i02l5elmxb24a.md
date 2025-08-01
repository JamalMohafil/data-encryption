---
title: "How to Setup Redis With Nest.js - Step by Step Guide"
seoTitle: "How to Setup Redis with Nest.js: Complete Step-by-Step Guide "
seoDescription: "Learn how to integrate Redis with Nest.js easily. This step-by-step guide helps you boost your app’s performance with fast, efficient caching and data stora"
datePublished: Fri Aug 01 2025 15:50:45 GMT+0000 (Coordinated Universal Time)
cuid: cmdt0347f000i02l5elmxb24a
slug: how-to-setup-redis-with-nestjs-step-by-step-guide
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1754063272469/d3b9ae2b-9f7c-40bb-bd85-55fccdef7bdc.png
tags: software-development, programming-blogs, redis, backend, databases

---

Hi there!

Hope you're doing great with your projects

You’ve probably already heard of **Redis** a powerful key-value database that’s widely used for caching data. What makes Redis stand out is its **incredible speed** a single request can take as little as **20ms**! That’s why many big companies use Redis to supercharge their systems.

In today’s blog, I’ll walk you through how to install and configure **Redis in a NestJS project** using the latest Redis features.

Let’s get started! 🚀

---

## Step 1: Set Up Your NestJS Project

First, create a new NestJS project:

```bash
npm i -g @nestjs/cli
nest new redis-project
```

Then install the configuration package:

```bash
npm install @nestjs/config
```

Now, create a folder named `redis` and inside it create a file called `redis.service.ts`.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754059430188/0680d047-a662-4cb6-a7dc-326784cf2239.png align="left")

---

## Step 2: Install Redis Dependencies

Install the Redis client library:

```typescript
npm install ioredis
# or using yarn
yarn add ioredis
```

---

## Step 3: Configure Redis in Your Project

### 1\. Create `.env` File

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754059524823/0f059aed-318f-4796-b0d3-3c1be4a436be.png align="left")

Add your Redis configuration variables:

```typescript
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_URL=
```

> **Note**: If you're running Redis locally, you usually don't need the username, password, or URL.

---

### 2\. Create Redis Config File

Inside the `redis/config` folder, create a file named `redis.config.ts`:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754059838982/b49b50ca-4a24-4188-88c9-50df293578db.png align="left")

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string, 10),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  url: process.env.REDIS_URL,
}));
```

Then register the config in your `app.module.ts`:

```typescript
tsCopyEditimport { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './redis/config/redis.config';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
```

---

## Step 4: Implement Redis Logic in the Service

Inside `redis.service.ts`, write the following:

```typescript
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import redisConfig from './config/redis.config';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  // This will be our Redis client instance, accessible throughout the service
  public redisClient: Redis.Redis;

  constructor(
    @Inject(redisConfig.KEY)
    // We're injecting the Redis config from our config file
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {}

  onModuleInit() {
    // This is where we build the configuration object for Redis
    const config = {
      host: this.redisConfiguration.host,
      port: this.redisConfiguration.port,
      username: this.redisConfiguration.username,
      password: this.redisConfiguration.password,
      url: this.redisConfiguration.url,
      retryDelayOnFailover: 100, // Retry delay when failover happens
      enableReadyCheck: true,    // Ensures Redis is ready before proceeding
      maxRetriesPerRequest: 3,   // Limits retry attempts to avoid hanging
    };

    this.logger.log('Connecting to Redis...', config);

    // Initialize the Redis client
    this.redisClient = new Redis.Redis(config);

    // Log when connected
    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected successfully');
    });

    // Log errors during connection or operation
    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });
  }

  onModuleDestroy() {
    // Properly close the Redis connection when the app shuts down
    this.redisClient.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Set a value in Redis under the given key.
   * If the value is an object, we convert it to a JSON string before saving,
   * because Redis only stores strings.
   */
  async set(key: string, value: any): Promise<string> {
    try {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      return await this.redisClient.set(key, stringValue);
    } catch (error) {
      this.logger.error(`Error setting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis using a key.
   * If the value is in JSON format, we parse it to convert it back to an object.
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;

      try {
        // Try to parse JSON string back to object
        return JSON.parse(value);
      } catch {
        // If parsing fails, just return the raw string value
        return value as T;
      }
    } catch (error) {
      this.logger.error(`Error getting key "${key}":`, error);
      return null;
    }
  }
}

```

Then put redis.service.ts in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './redis/config/redis.config';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
```

---

## Step 5: Use Redis in Your Repositories or Services (Example)

Example usage inside a repository:

```typescript
@Injectable()
export class SessionRepository {
  constructor(private readonly redisService: RedisService) {}

  async create(session: SessionEntity): Promise<SessionEntity> {
    const raw = SessionMapper.toPrimitives(session);
    await this.redisService.set(`session:${session.id}`, raw);
    return session;
  }
}
```

---

## Final Words

Congrats You’ve successfully integrated Redis into your NestJS project. You can now use it to cache data, store sessions, or optimize performance however you want

If you found this guide helpful, feel free to share it.  
And if you need help with your own projects, feel free to reach out I’d be happy to help.

**Have a productive day ❤️.**