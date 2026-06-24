// frontend/src/lib/roadmapParser.js
import fs from 'fs';
import path from 'path';

export function getStructuredRoadmap() {
  try {
    const filePath = path.join(process.cwd(), '../roadmap.md');
    if (!fs.existsSync(filePath)) {
      console.error(`Roadmap file not found at ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const weeks = [];
    let currentWeek = null;
    let currentDay = null;
    let currentItem = null;

    let weekIdCounter = 1;
    let dayIdCounter = 1;
    let itemIdCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) continue;

      if (line.startsWith('## Week')) {
        currentWeek = {
          id: `week-${weekIdCounter++}`,
          title: trimmed.replace(/^##\s*/, ''),
          days: [],
        };
        weeks.push(currentWeek);
        currentDay = null;
        currentItem = null;
      } else if (line.startsWith('### Day')) {
        if (currentWeek) {
          currentDay = {
            id: `day-${dayIdCounter++}`,
            title: trimmed.replace(/^###\s*/, ''),
            items: [],
          };
          currentWeek.days.push(currentDay);
          currentItem = null;
        }
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (currentDay) {
          currentItem = {
            id: `item-${itemIdCounter++}`,
            text: trimmed.replace(/^[-*]\s*/, ''),
            subItems: [],
          };
          currentDay.items.push(currentItem);
        }
      } else if (
        line.startsWith('  - ') ||
        line.startsWith('    - ') ||
        line.startsWith('\t- ')
      ) {
        if (currentItem) {
          currentItem.subItems.push(trimmed.replace(/^[-*]\s*/, ''));
        }
      }
    }

    return weeks;
  } catch (error) {
    console.error('Failed to parse roadmap markdown:', error);
    return [];
  }
}
