// backend/src/controllers/revision.controller.js
const revisionService = require('../services/revision.service');

class RevisionController {
  async getRevisions(req, res, next) {
    try {
      const revisions = await revisionService.getRevisions(req.params.noteId, req.user);
      res.json(revisions);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getRevisionSnapshot(req, res, next) {
    try {
      const revision = await revisionService.getRevisionSnapshot(req.params.noteId, req.params.revisionId, req.user);
      res.json(revision);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async restoreRevision(req, res, next) {
    try {
      const result = await revisionService.restoreRevision(req.params.noteId, req.params.revisionId, req.user);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new RevisionController();
