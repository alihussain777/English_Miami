import { NextResponse } from 'next/server';

export async function GET() {
  const readingArticles = [
    {
      id: 'read-a1-sunshine-state',
      level: 'A1',
      title: 'A Sunny Day in Miami',
      passage: `Miami is a famous city in Florida. The weather is warm and sunny almost every day. People come from all over the world to see the beautiful beaches and tall palm trees. In the afternoon, families walk along Ocean Drive. They eat delicious ice cream and listen to music. It is a peaceful and happy place to practice English.`,
      wordGlosses: {
        famous: 'Known by many people',
        weather: 'The state of the atmosphere (hot, cold, sunny)',
        peaceful: 'Quiet, calm and tranquil',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'What is the weather usually like in Miami?',
          options: ['Cold and snowy', 'Warm and sunny', 'Rainy and dark', 'Freezing windy'],
          correct: 'Warm and sunny',
          explanation: 'The text states: "The weather is warm and sunny almost every day."',
        },
      ],
    },
    {
      id: 'read-b1-remote-work',
      level: 'B1',
      title: 'The Evolution of the Global Workplace',
      passage: `Over the past decade, remote work has fundamentally transformed international career opportunities. Professionals in Madrid, Buenos Aires, or Lahore can now collaborate seamlessly with technology firms headquartered in Miami and Silicon Valley. However, remote collaboration demands exceptional linguistic precision. Clear written communication and confident spoken English have become the primary currency of the global economy.`,
      wordGlosses: {
        fundamentally: 'In a basic and most important way',
        seamlessly: 'Smoothly and continuously, without interruption',
        currency: 'Something of value that is widely accepted',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'What has become "the primary currency of the global economy" according to the passage?',
          options: [
            'Physical gold reserves',
            'Clear written and spoken English',
            'Expensive office buildings',
            'Commuter rail systems',
          ],
          correct: 'Clear written and spoken English',
          explanation: 'The final sentence states that clear written communication and confident spoken English have become the primary currency.',
        },
      ],
    },
    {
      id: 'read-b2-bilingual-brain',
      level: 'B2',
      title: 'Neuroplasticity and Language Acquisition',
      passage: `Cognitive neuroscience has demonstrated that acquiring a second language rewires neural pathways, enhancing problem-solving acumen and delaying cognitive decline. Adult learners often mistakenly assume that children possess an insurmountable biological advantage. In reality, while children absorb accent phonetics intuitively, adults leverage sophisticated meta-cognitive frameworks, allowing them to systematize grammar and vocabulary with remarkable velocity when provided with targeted spaced repetition.`,
      wordGlosses: {
        neuroplasticity: 'The brain\'s ability to adapt and reorganize neural pathways',
        insurmountable: 'Too great to be overcome',
        velocity: 'Speed and rate of motion or progress',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'What advantage do adult language learners possess over children according to the article?',
          options: [
            'Better intuitive accent mimicry',
            'Meta-cognitive frameworks and systematic learning',
            'More free time during school hours',
            'Faster vocal cord development',
          ],
          correct: 'Meta-cognitive frameworks and systematic learning',
          explanation: 'The text highlights that adults leverage sophisticated meta-cognitive frameworks to systematize grammar and vocabulary.',
        },
      ],
    },
  ];

  return NextResponse.json({ articles: readingArticles });
}
