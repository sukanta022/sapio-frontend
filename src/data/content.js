export const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';

export const DEFAULT_BOOK = {
  title: 'Atomic Habits',
  author: 'James Clear',
  img: DEFAULT_COVER,
  duration: '12:00',
};

export const CUSTOM_DOC_BOOK = {
  title: 'Uploaded Custom Document',
  author: 'Sapio AI Engine',
  img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&auto=format&fit=crop&q=80',
  duration: '10 min',
};

export const books = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'self',
    tag: 'Self Improvement',
    duration: '12 min',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'tech',
    tag: 'Productivity',
    duration: '14 min',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'thinking-fast-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'business',
    tag: 'Psychology',
    duration: '16 min',
    img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    category: 'fiction',
    tag: 'Sci-Fi Classic',
    duration: '18 min',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
  },
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'self', label: 'Self-Improvement' },
  { id: 'business', label: 'Business & Finance' },
  { id: 'tech', label: 'Tech & AI' },
];

export const transcriptLines = [
  'Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them.',
  'Small 1% changes every day accumulate into massive transformations over a year, yielding 37 times better results.',
  'Forget about goals, focus on systems instead. You do not rise to the level of your goals; you fall to the level of your systems.',
  'Identity change is the ultimate North Star for habit formation. Decide the type of person you want to be, then prove it to yourself with small wins.',
];

export const summaryTypes = [
  { id: '10min', title: '10-Min Express', sub: 'Key Takeaways' },
  { id: '30min', title: '30-Min Recap', sub: 'Deep Insights' },
  { id: 'chapter', title: 'Chapter Breakdown', sub: 'Full Outline' },
];

export const voices = [
  { id: 'james', label: '🎙️ James - Conversational & Engaging (US Male)' },
  { id: 'elena', label: '🎙️ Elena - Authoritative & Clear (UK Female)' },
  { id: 'marcus', label: '🎙️ Marcus - Executive Deep Tone (US Male)' },
  { id: 'sophia', label: '🎙️ Sophia - Calm & Educational (AU Female)' },
];

export const chapters = [
  { id: 1, label: 'Ch 1: The 1% Rule' },
  { id: 2, label: 'Ch 2: Identity Shift' },
  { id: 3, label: 'Ch 3: The 4 Laws' },
];

export const searchItems = [
  'Atomic Habits',
  'Deep Work',
  'Thinking, Fast and Slow',
  'Dune',
  'The Psychology of Money',
  'Zero to One',
  'Sapiens',
];

export const pipelineSteps = [
  {
    n: 1,
    title: 'Document Ingestion',
    text: 'Upload any PDF, EPUB, or select from our curated store. OCR parses figures & text.',
    tag: 'STEP 01 // PARSE',
  },
  {
    n: 2,
    title: 'LLM Script Generation',
    text: "Sapio's core model distills key insights, key quotes, and formats an engaging audio script.",
    tag: 'STEP 02 // SUMMARIZE',
  },
  {
    n: 3,
    title: 'Neural TTS Voice',
    text: 'Synthesizes natural, human-like cadence and emphasis with multi-narrator options.',
    tag: 'STEP 03 // SYNTHESIZE',
  },
  {
    n: 4,
    title: 'Chapter & Read Sync',
    text: 'Listen on the go or follow along with dynamic transcript highlighting & PDF modal.',
    tag: 'STEP 04 // SYNC & LISTEN',
  },
];
