const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah thread body',
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
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload did not conatain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
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
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: ['sebuah thread body'],
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
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread with comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-321',
        username: 'johndoe',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah comment dihapus',
        threadId: 'thread-123',
        owner: 'user-321',
      });
      await CommentsTableTestHelper.deleteCommentById('comment-123');
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-321',
        content: 'sebuah comment reply dihapus',
        commentId: 'comment-321',
        threadId: 'thread-123',
        owner: 'user-321',
      });
      await RepliesTableTestHelper.deleteReplyById('reply-321');

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread did not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
