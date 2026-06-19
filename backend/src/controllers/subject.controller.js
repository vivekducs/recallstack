// backend/src/controllers/subject.controller.js
const subjectService = require('../services/subject.service');

class SubjectController {
  async getSubjects(req, res, next) {
    try {
      const subjects = await subjectService.getSubjects();
      res.json(subjects);
    } catch (err) {
      next(err);
    }
  }

  async getSubjectById(req, res, next) {
    try {
      const subject = await subjectService.getSubjectByIdOrSlug(req.params.id);
      res.json(subject);
    } catch (err) {
      if (err.message === 'Subject not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async createSubject(req, res, next) {
    try {
      const subject = await subjectService.createSubject(req.body);
      res.status(201).json(subject);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const subject = await subjectService.updateSubject(req.params.id, req.body);
      res.json(subject);
    } catch (err) {
      next(err);
    }
  }

  async deleteSubject(req, res, next) {
    try {
      const result = await subjectService.deleteSubject(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubjectController();
