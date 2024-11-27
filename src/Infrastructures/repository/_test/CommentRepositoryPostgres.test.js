const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
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

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const comment = new AddComment({
        content: 'sebuah comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(comment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const comment = new AddComment({
        content: 'sebuah comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: comment.content,
        owner: comment.owner,
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah content',
        username: 'dicoding',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const actualResult = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      const expectedCommentDate = await CommentsTableTestHelper.findDateById('comment-123');
      const expectedResult = [
        new GetComment({
          id: 'comment-123',
          username: 'dicoding',
          date: expectedCommentDate,
          content: 'sebuah content',
          isDelete: false,
        }),
      ];
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment from database', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyAvailableComment('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyAvailableComment('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment owner is not correct', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-321')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment owner is correct', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
