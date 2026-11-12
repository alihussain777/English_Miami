import { NextResponse } from 'next/server';

export async function GET() {
  const readingArticles = [
    {
      id: 'read-a1-sunshine-state',
      level: 'A1',
      title: 'A Sunny Day in Miami',
      passage: `Miami is a famous coastal city in southern Florida. The weather is warm and sunny almost every day of the year. Visitors come from all over the world to see the sandy beaches and tall palm trees. In the afternoon, families walk along Ocean Drive together. They eat cold ice cream, listen to lively music, and practice speaking friendly English with local shopkeepers.`,
      wordGlosses: {
        famous: 'Known and recognized by many people around the world',
        weather: 'The daily state of the atmosphere (warm, sunny, rainy, or windy)',
        peaceful: 'Quiet, calm, and free from stress or disturbance',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'How does the passage describe the typical weather and atmosphere in Miami?',
          options: [
            'It is freezing cold and covered in heavy snow during most of the year.',
            'It is warm and sunny almost every day, drawing visitors to its beaches.',
            'It is dark, foggy, and closed to international travelers in the afternoon.',
            'It is a quiet mountain village where nobody speaks English in the shops.',
          ],
          correct: 'It is warm and sunny almost every day, drawing visitors to its beaches.',
          explanation: 'The passage states: "The weather is warm and sunny almost every day of the year."',
        },
      ],
    },
    {
      id: 'read-b1-remote-work',
      level: 'B1',
      title: 'The Evolution of the Global Workplace',
      passage: `Over the past decade, remote work has fundamentally transformed international career opportunities. Professionals in Madrid, Buenos Aires, New Delhi, or Lahore can now collaborate seamlessly with technology firms headquartered in Miami and Silicon Valley. However, remote collaboration demands exceptional linguistic precision. Clear written communication and confident spoken English have become the primary currency of the modern global economy.`,
      wordGlosses: {
        fundamentally: 'In a basic, essential, and most important way',
        seamlessly: 'Smoothly and continuously, without awkward gaps or interruption',
        currency: 'Something of high value that is widely accepted across borders',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'What has become "the primary currency of the modern global economy" according to the text?',
          options: [
            'Owning expensive downtown office buildings in major European capitals.',
            'Clear written communication and confident spoken English proficiency.',
            'Traveling by high-speed commuter trains to local factories every morning.',
            'Replacing all international team meetings with handwritten postal letters.',
          ],
          correct: 'Clear written communication and confident spoken English proficiency.',
          explanation: 'The final sentence highlights that clear written communication and confident spoken English have become the primary currency.',
        },
      ],
    },
    {
      id: 'read-b2-bilingual-brain',
      level: 'B2',
      title: 'Neuroplasticity and Language Acquisition',
      passage: `Cognitive neuroscience has demonstrated that acquiring a second language rewires neural pathways, enhancing problem-solving acumen and delaying cognitive decline. Adult learners often mistakenly assume that children possess an insurmountable biological advantage. In reality, while children absorb accent phonetics intuitively, adults leverage sophisticated meta-cognitive frameworks, allowing them to systematize grammar and vocabulary with remarkable velocity when provided with targeted spaced repetition.`,
      wordGlosses: {
        neuroplasticity: 'The brain’s lifelong ability to adapt and reorganize neural pathways',
        insurmountable: 'Too great or difficult to be overcome',
        velocity: 'Speed and rate of progress in mastering a skill',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'What distinct advantage do adult language learners possess compared to young children?',
          options: [
            'Adults have more free hours during the summer to watch animated cartoons.',
            'Adults use meta-cognitive frameworks to systematize grammar and vocabulary.',
            'Adults never need to practice pronunciation or review new vocabulary words.',
            'Adults automatically memorize every dictionary word after hearing it once.',
          ],
          correct: 'Adults use meta-cognitive frameworks to systematize grammar and vocabulary.',
          explanation: 'The text explains that adults leverage sophisticated meta-cognitive frameworks to systematize grammar and vocabulary rapidly.',
        },
      ],
    },
  ];

  return NextResponse.json({ articles: readingArticles });
}
