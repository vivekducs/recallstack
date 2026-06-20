// backend/prisma/seed_course.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper to slugify note titles
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// Helper to count words and estimate reading time
function estimateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Parses a single module file and returns a list of notes + sections
function parseModuleFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const notes = [];

  // Split by Topic headers
  // E.g., "## Topic 1: What is Artificial Intelligence?"
  const parts = fileContent.split(/\n## Topic \d+:\s+/);
  
  // The first part (before Topic 1) is the module title and intro
  const moduleIntro = parts[0];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lines = part.split('\n');
    const topicTitle = lines[0].trim();
    const topicContent = lines.slice(1).join('\n');

    // Parse sub-sections
    // E.g., "### Definition", "### Why It Exists", "### Python Example"
    const subParts = topicContent.split(/\n###\s+/);
    const sections = [];

    // The first subPart is any general intro content before "### Definition"
    if (subParts[0].trim()) {
      sections.push({
        title: 'Overview',
        content: subParts[0].trim(),
        contentType: 'TEXT',
      });
    }

    for (let j = 1; j < subParts.length; j++) {
      const subPart = subParts[j];
      const subLines = subPart.split('\n');
      const sectionHeader = subLines[0].trim();
      let sectionContent = subLines.slice(1).join('\n').trim();

      let contentType = 'TEXT';
      let language = null;

      // Classify section content types
      if (sectionHeader.toLowerCase().includes('example') || sectionHeader.toLowerCase().includes('use case')) {
        contentType = 'EXAMPLE';
      } else if (sectionHeader.toLowerCase().includes('diagram') || sectionHeader.toLowerCase().includes('flowchart')) {
        contentType = 'DIAGRAM';
      }

      // Check if it's a code block (like Python Example)
      if (sectionContent.startsWith('```')) {
        contentType = 'CODE';
        // Extract language and code body
        const codeLines = sectionContent.split('\n');
        const match = codeLines[0].match(/```(\w+)?/);
        language = match ? match[1] || 'python' : 'python';
        // Remove markdown wrappers
        sectionContent = codeLines.slice(1).filter(line => !line.startsWith('```')).join('\n').trim();
      }

      sections.push({
        title: sectionHeader,
        content: sectionContent,
        contentType,
        language,
      });
    }

    // Determine difficulty based on tags or heuristics
    let difficulty = 'MEDIUM';
    if (topicTitle.toLowerCase().includes('fundamentals') || topicTitle.toLowerCase().includes('what is')) {
      difficulty = 'EASY';
    } else if (topicTitle.toLowerCase().includes('advanced') || topicTitle.toLowerCase().includes('security') || topicTitle.toLowerCase().includes('async')) {
      difficulty = 'HARD';
    }

    notes.push({
      title: topicTitle,
      slug: slugify(topicTitle),
      excerpt: sections[0] ? sections[0].content.substring(0, 160) + '...' : 'Detailed course notes on ' + topicTitle,
      difficulty,
      tags: ['ai-engineering', 'course', slugify(topicTitle.split(' ')[0])],
      sections,
    });
  }

  return notes;
}

// Parses general non-module files (assignments, project, prep guide) into single notes
function parseGeneralFile(filePath, title, slug, excerpt, difficulty, tags) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split by secondary headings
  const parts = content.split(/\n##\s+/);
  const sections = [];

  // Add the introduction section
  if (parts[0].trim()) {
    sections.push({
      title: 'Introduction',
      content: parts[0].trim().replace(/^#\s+.+/, '').trim(), // Remove the main title
      contentType: 'TEXT',
    });
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lines = part.split('\n');
    const header = lines[0].trim();
    let sectionContent = lines.slice(1).join('\n').trim();

    let contentType = 'TEXT';
    let language = null;

    if (header.toLowerCase().includes('code') || sectionContent.startsWith('```')) {
      contentType = 'CODE';
      const codeLines = sectionContent.split('\n');
      const match = codeLines[0].match(/```(\w+)?/);
      language = match ? match[1] || 'python' : 'python';
      sectionContent = codeLines.slice(1).filter(line => !line.startsWith('```')).join('\n').trim();
    } else if (header.toLowerCase().includes('diagram') || header.toLowerCase().includes('cheat sheet')) {
      contentType = 'DIAGRAM';
    }

    sections.push({
      title: header,
      content: sectionContent,
      contentType,
      language,
    });
  }

  return {
    title,
    slug,
    excerpt,
    difficulty,
    tags,
    sections,
  };
}

async function main() {
  console.log('Starting Course Seeding process...');

  // 1. Retrieve the target subject (AI Engineering)
  let subject = await prisma.subject.findUnique({
    where: { slug: 'ai-engineering' }
  });

  if (!subject) {
    console.log('Subject "ai-engineering" not found. Creating it...');
    subject = await prisma.subject.create({
      data: {
        name: 'AI Engineering',
        slug: 'ai-engineering',
        description: 'Learn prompt engineering, RAG pipelines, orchestration frameworks, agents, fine-tuning, and LLM security.',
        icon: 'ai',
        color: '#a855f7',
        order: 9
      }
    });
  }

  // 2. Retrieve the target topic
  let topic = await prisma.topic.findFirst({
    where: { subjectId: subject.id, slug: 'ai-engineering-core' }
  });

  if (!topic) {
    console.log('Topic "ai-engineering-core" not found. Creating it...');
    topic = await prisma.topic.create({
      data: {
        name: 'AI Engineering Core',
        slug: 'ai-engineering-core',
        description: 'Master large language models, prompt engineering, RAG pipelines, orchestration frameworks, agents, fine-tuning, and guardrails.',
        order: 1,
        subjectId: subject.id
      }
    });
  }

  // 3. Find Admin User to assign as Note Author
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    throw new Error('No user accounts exist in the database. Please seed users first.');
  }

  console.log(`Seeding notes with author: ${admin.email}`);

  // Resolve absolute path to course/ folder
  const coursePath = path.join(__dirname, '..', '..', '..', 'course');
  
  if (!fs.existsSync(coursePath)) {
    throw new Error(`Course directory not found at: ${coursePath}`);
  }

  const allNotes = [];

  // Parse Modules
  const modules = [
    { file: 'module1_intro_to_ai.md' },
    { file: 'module2_python_for_ai.md' },
    { file: 'module3_apis_and_backend.md' },
    { file: 'module4_llm_fundamentals.md' },
    { file: 'module5_git_mastery.md' },
    { file: 'module6_rag_fundamentals.md' },
    { file: 'module7_agents_and_orchestration.md' },
    { file: 'module8_finetuning.md' },
  ];

  for (const mod of modules) {
    const filePath = path.join(coursePath, mod.file);
    if (fs.existsSync(filePath)) {
      console.log(`Parsing module: ${mod.file}`);
      const parsedNotes = parseModuleFile(filePath);
      allNotes.push(...parsedNotes);
    }
  }

  // Parse Assignments, Projects, and Prep Guides
  const assignmentPath = path.join(coursePath, 'assignments.md');
  if (fs.existsSync(assignmentPath)) {
    console.log('Parsing assignments.md...');
    allNotes.push(parseGeneralFile(
      assignmentPath,
      'Practical Lab Assignments',
      'course-practical-lab-assignments',
      '20 hands-on programming challenges designed to test Python, FastAPI, and LLM orchestration skills.',
      'MEDIUM',
      ['ai-engineering', 'course', 'assignments']
    ));
  }

  const projectPath = path.join(coursePath, 'mini_project.md');
  if (fs.existsSync(projectPath)) {
    console.log('Parsing mini_project.md...');
    allNotes.push(parseGeneralFile(
      projectPath,
      'Mini Project: Build an AI Chat Assistant',
      'course-mini-project-chat-assistant',
      'Step-by-step tutorial building a production-grade FastAPI assistant integrated with the Gemini API.',
      'HARD',
      ['ai-engineering', 'course', 'project', 'fastapi']
    ));
  }

  const prepPath = path.join(coursePath, 'interview_prep.md');
  if (fs.existsSync(prepPath)) {
    console.log('Parsing interview_prep.md...');
    allNotes.push(parseGeneralFile(
      prepPath,
      'Interview Prep & Revision Guide',
      'course-interview-prep-revision-guide',
      '50 essential interview questions with detailed answers, revision notes, and quick cheat sheets.',
      'MEDIUM',
      ['ai-engineering', 'course', 'interview-prep']
    ));
  }

  console.log(`Successfully parsed ${allNotes.length} notes. Inserting into database...`);

  let addedNotesCount = 0;

  for (const noteData of allNotes) {
    // Check if a note with the same slug already exists under this topic
    const existingNote = await prisma.note.findFirst({
      where: { topicId: topic.id, slug: noteData.slug }
    });

    if (existingNote) {
      console.log(`Note already exists: "${noteData.title}". Skipping to avoid duplicates.`);
      continue;
    }

    // Estimate total reading time from section content
    const fullContentText = noteData.sections.map(s => s.content).join(' ');
    const readingTime = estimateReadingTime(fullContentText);

    // Create the note
    const newNote = await prisma.note.create({
      data: {
        title: noteData.title,
        slug: noteData.slug,
        excerpt: noteData.excerpt,
        difficulty: noteData.difficulty,
        tags: noteData.tags,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readingTime,
        topicId: topic.id,
        authorId: admin.id,
      }
    });

    // Create sections in order
    await prisma.section.createMany({
      data: noteData.sections.map((sec, idx) => ({
        title: sec.title,
        content: sec.content,
        contentType: sec.contentType,
        language: sec.language,
        order: idx,
        noteId: newNote.id,
      }))
    });

    addedNotesCount++;
    console.log(`Seeded Note: "${noteData.title}" (${noteData.sections.length} sections)`);
  }

  // Update counts on Subject and Topic
  if (addedNotesCount > 0) {
    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        notesCount: { increment: addedNotesCount },
        lastUpdated: new Date()
      }
    });

    await prisma.subject.update({
      where: { id: subject.id },
      data: {
        notesCount: { increment: addedNotesCount }
      }
    });
  }

  console.log(`\nSuccess! Seeded ${addedNotesCount} new notes and articles into the RecallStack database.`);
}

main()
  .catch(e => {
    console.error('Course seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
