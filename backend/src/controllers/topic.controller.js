// backend/src/controllers/topic.controller.js
const topicService = require('../services/topic.service');

class TopicController {
  async getTopics(req, res, next) {
    try {
      const topics = await topicService.getTopics(req.params.subjectId);
      res.json(topics);
    } catch (err) {
      if (err.message === 'Subject not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async createTopic(req, res, next) {
    try {
      const topic = await topicService.createTopic(req.params.subjectId, req.body);
      res.status(201).json(topic);
    } catch (err) {
      if (err.message === 'Subject not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updateTopic(req, res, next) {
    try {
      const topic = await topicService.updateTopic(req.params.id, req.body);
      res.json(topic);
    } catch (err) {
      next(err);
    }
  }

  async deleteTopic(req, res, next) {
    try {
      const result = await topicService.deleteTopic(req.params.id);
      res.json(result);
    } catch (err) {
      if (err.message === 'Topic not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new TopicController();
