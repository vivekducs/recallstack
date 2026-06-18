// backend/src/utils/readingTime.js

const prisma = require('../config/database');

async function calculateNoteReadingTime(noteId) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { sections: true }
  });

  if (!note) return null;

  // Calculate total words from TEXT and EXAMPLE sections
  let totalWords = 0;
  note.sections.forEach(section => {
    if (section.contentType === 'TEXT' || section.contentType === 'EXAMPLE') {
      const words = section.content.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += words;
    }
  });

  // Average reading speed: 200 words/minute, minimum 1 minute
  const readingTime = Math.ceil(totalWords / 200) || 1;

  return readingTime;
}

async function updateNoteReadingTime(noteId) {
  const readingTime = await calculateNoteReadingTime(noteId);
  if (readingTime !== null) {
    await prisma.note.update({
      where: { id: noteId },
      data: { readingTime }
    });
  }
  return readingTime;
}

module.exports = { calculateNoteReadingTime, updateNoteReadingTime };
