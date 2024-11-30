const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLikeComment(likeComment) {
    const { commentId, owner } = likeComment;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id, comment_id, owner',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async verifyAvailableLikeComment(commentId, owner) {
    const query = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return result.rows.length > 0 ? result.rows[0].id : undefined;
  }

  async deleteLikeCommentById(id) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = LikeRepositoryPostgres;
