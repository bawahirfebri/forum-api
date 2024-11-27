const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment',
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
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
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
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['sebuah comment'],
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
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread did not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment',
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
        url: '/threads/thread-321/comments',
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when success deleting comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

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
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when deleting comment not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'johndoe', fullname: 'John Doe' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

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
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting comment from unavailable thread', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

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
        url: '/threads/thread-321/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting comment from unavailable comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

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
        url: '/threads/thread-123/comments/comment-321',
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
