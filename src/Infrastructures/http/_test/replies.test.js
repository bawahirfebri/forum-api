const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment reply',
      };

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const requestPayload = {};

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['sebuah comment reply'],
      };

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread did not exist', async () => {
      // Arrange
      const requestPayload = {
        content: ['sebuah comment reply'],
      };

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-321/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when comment did not exist', async () => {
      // Arrange
      const requestPayload = {
        content: ['sebuah comment reply'],
      };

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-321/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when thread and comment did not exist', async () => {
      // Arrange
      const requestPayload = {
        content: ['sebuah comment reply'],
      };

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-321/comments/comment-321/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when success deleting reply', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', threadId: 'thread-123', commentId: 'comment-123' });

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when deleting reply not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'johndoe', fullname: 'John Doe' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123',
      });

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-321',
        username: 'johndoe',
        fullname: 'John Doe',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting reply from unavailable thread', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', threadId: 'thread-123', commentId: 'comment-123' });

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-321/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting reply from unavailable comment', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', threadId: 'thread-123', commentId: 'comment-123' });

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-321/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting reply from unavailable reply', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', threadId: 'thread-123', commentId: 'comment-123' });

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken(mockRegisteredUser);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-321',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
