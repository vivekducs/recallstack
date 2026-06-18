// prisma/seed.js
// Seed script to populate initial data for development

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@recallstack.com' },
    update: {},
    create: {
      name: 'Admin',
      username: 'admin',
      email: 'admin@recallstack.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create test user
  const userPassword = await bcrypt.hash('user12345', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@recallstack.com' },
    update: {},
    create: {
      name: 'Test User',
      username: 'testuser',
      email: 'user@recallstack.com',
      passwordHash: userPassword,
      role: 'USER'
    }
  });
  console.log(`✅ Test user: ${user.email}`);

  // Create subjects
  const subjects = [
    {
      name: 'Data Structures & Algorithms',
      slug: 'dsa',
      description: 'Master fundamental data structures and algorithms for coding interviews and competitive programming.',
      icon: '📊',
      color: '#6366f1',
      order: 1
    },
    {
      name: 'System Design',
      slug: 'system-design',
      description: 'Learn how to design scalable, reliable, and efficient systems for real-world applications.',
      icon: '🏗️',
      color: '#8b5cf6',
      order: 2
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Full-stack web development covering frontend, backend, databases, and deployment.',
      icon: '🌐',
      color: '#06b6d4',
      order: 3
    },
    {
      name: 'Interview Prep',
      slug: 'interview-prep',
      description: 'Comprehensive preparation guide for technical interviews at top companies.',
      icon: '🎯',
      color: '#f59e0b',
      order: 4
    }
  ];

  for (const subjectData of subjects) {
    const subject = await prisma.subject.upsert({
      where: { slug: subjectData.slug },
      update: {},
      create: subjectData
    });
    console.log(`✅ Subject: ${subject.name}`);
  }

  // Get DSA subject for topics
  const dsa = await prisma.subject.findUnique({ where: { slug: 'dsa' } });

  // Create topics under DSA
  const dsaTopics = [
    { name: 'Sorting Algorithms', slug: 'sorting-algorithms', description: 'Learn various sorting techniques and their trade-offs.', order: 1 },
    { name: 'Dynamic Programming', slug: 'dynamic-programming', description: 'Master the art of breaking problems into optimal subproblems.', order: 2 },
    { name: 'Graph Algorithms', slug: 'graph-algorithms', description: 'Explore graph traversal, shortest paths, and network flow.', order: 3 },
    { name: 'Trees & Binary Trees', slug: 'trees', description: 'Binary trees, BSTs, AVL trees, and tree traversals.', order: 4 }
  ];

  let topicCount = 0;
  for (const topicData of dsaTopics) {
    const existing = await prisma.topic.findFirst({
      where: { subjectId: dsa.id, slug: topicData.slug }
    });
    if (!existing) {
      await prisma.topic.create({
        data: { ...topicData, subjectId: dsa.id, notesCount: 0 }
      });
      topicCount++;
    }
  }

  // Update DSA topicsCount
  await prisma.subject.update({
    where: { id: dsa.id },
    data: { topicsCount: dsaTopics.length }
  });

  // Get System Design subject for topics
  const sysDesign = await prisma.subject.findUnique({ where: { slug: 'system-design' } });

  const sysDesignTopics = [
    { name: 'Load Balancing', slug: 'load-balancing', description: 'Distribute traffic across servers efficiently.', order: 1 },
    { name: 'Caching Strategies', slug: 'caching', description: 'Speed up systems with intelligent caching.', order: 2 },
    { name: 'Database Design', slug: 'database-design', description: 'SQL vs NoSQL, sharding, replication.', order: 3 }
  ];

  for (const topicData of sysDesignTopics) {
    const existing = await prisma.topic.findFirst({
      where: { subjectId: sysDesign.id, slug: topicData.slug }
    });
    if (!existing) {
      await prisma.topic.create({
        data: { ...topicData, subjectId: sysDesign.id, notesCount: 0 }
      });
    }
  }

  await prisma.subject.update({
    where: { id: sysDesign.id },
    data: { topicsCount: sysDesignTopics.length }
  });

  // Create a sample note under Sorting Algorithms
  const sortingTopic = await prisma.topic.findFirst({
    where: { subjectId: dsa.id, slug: 'sorting-algorithms' }
  });

  if (sortingTopic) {
    const existingNote = await prisma.note.findFirst({
      where: { topicId: sortingTopic.id, slug: 'merge-sort-complete-guide' }
    });

    if (!existingNote) {
      const note = await prisma.note.create({
        data: {
          title: 'Merge Sort Complete Guide',
          slug: 'merge-sort-complete-guide',
          excerpt: 'A comprehensive guide to understanding and implementing Merge Sort with time complexity analysis.',
          difficulty: 'MEDIUM',
          tags: ['sorting', 'divide-and-conquer', 'recursion'],
          topicId: sortingTopic.id,
          authorId: admin.id,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          readingTime: 8
        }
      });

      // Create sections
      await prisma.section.createMany({
        data: [
          {
            title: 'What is Merge Sort?',
            content: 'Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, recursively sorts each half, and then merges the sorted halves. It was invented by John von Neumann in 1945.\n\nThe key insight is that merging two sorted arrays into one sorted array is an O(n) operation. By recursively dividing the problem and merging, we achieve an overall O(n log n) time complexity.',
            contentType: 'TEXT',
            order: 0,
            noteId: note.id
          },
          {
            title: 'Implementation',
            content: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  \n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  \n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  \n  while (i < left.length && j < right.length) {\n    if (left[i] <= right[j]) {\n      result.push(left[i++]);\n    } else {\n      result.push(right[j++]);\n    }\n  }\n  \n  return [...result, ...left.slice(i), ...right.slice(j)];\n}',
            contentType: 'CODE',
            language: 'javascript',
            order: 1,
            noteId: note.id
          },
          {
            title: 'Time Complexity Analysis',
            content: 'Merge Sort has the following time complexity characteristics:\n\n• Best Case: O(n log n) - Even if the array is already sorted\n• Average Case: O(n log n) - Consistent performance\n• Worst Case: O(n log n) - Guaranteed upper bound\n• Space Complexity: O(n) - Requires additional space for merging\n\nThis makes Merge Sort particularly useful when:\n1. Guaranteed O(n log n) is required\n2. Stable sorting is needed\n3. Working with linked lists (no extra space needed)\n4. External sorting of large datasets',
            contentType: 'TEXT',
            order: 2,
            noteId: note.id
          },
          {
            title: 'Real-World Example',
            content: 'Consider sorting a deck of cards:\n\n1. Split the deck into two halves\n2. Sort each half (by recursively splitting)\n3. Merge by comparing the top cards of each pile\n\nThis is exactly what Merge Sort does! Companies like Google and Mozilla use variants of Merge Sort in their Array.sort() implementations (TimSort, which is a hybrid).',
            contentType: 'EXAMPLE',
            order: 3,
            noteId: note.id
          }
        ]
      });

      // Update counts
      await prisma.topic.update({
        where: { id: sortingTopic.id },
        data: { notesCount: 1, lastUpdated: new Date() }
      });
      await prisma.subject.update({
        where: { id: dsa.id },
        data: { notesCount: 1 }
      });

      console.log(`✅ Sample note: ${note.title}`);
    }
  }

  console.log('\n🎉 Seed completed!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin: admin@recallstack.com / admin12345');
  console.log('  User:  user@recallstack.com / user12345');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
