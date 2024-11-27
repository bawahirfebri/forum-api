const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const GetReply = require('../../Domains/replies/entities/GetReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const {
      content, owner, commentId, threadId,
    } = reply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0], threadId });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, replies.date, replies.content, replies.comment_id, replies.is_delete, users.username
      FROM replies
      LEFT JOIN users ON users.id = replies.owner
      WHERE replies.comment_id = $1
      ORDER BY replies.is_delete DESC, replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(({ comment_id, is_delete, ...reply }) => (new GetReply({
      ...reply, commentId: comment_id, isDelete: is_delete,
    })));
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async verifyAvailableReply(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak berhak mengakases reply ini');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
