import { NextResponse } from 'next/server';

export async function GET() {
  const listeningModules = [
    {
      id: 'listen-a1-airport',
      level: 'A1',
      title: 'Checking in at Miami International Airport',
      audioSpeakerText: `Good morning! Welcome to American Airlines. May I please see your passport and your ticket? ... Thank you. Are you checking any luggage today? ... Perfect, place your suitcase on the scale. Your gate is D24 and boarding begins at 10:30 AM. Have a wonderful flight!`,
      speaker: 'Airport Agent',
      durationSeconds: 30,
      questions: [
        {
          id: 'q1',
          prompt: 'Which gate is the passenger departing from?',
          options: ['Gate B12', 'Gate D24', 'Gate A10', 'Gate C15'],
          correct: 'Gate D24',
          explanation: 'The agent explicitly states: "Your gate is D24".',
        },
        {
          id: 'q2',
          prompt: 'What time does boarding begin?',
          options: ['9:30 AM', '10:00 AM', '10:30 AM', '11:15 AM'],
          correct: '10:30 AM',
          explanation: 'The agent says boarding begins at 10:30 AM.',
        },
      ],
    },
    {
      id: 'listen-b1-coffee-interview',
      level: 'B1',
      title: 'Coffee Shop Job Interview',
      audioSpeakerText: `Hi Carlos, thanks for coming in today. We are looking for someone who thrives in a fast-paced environment and enjoys talking with customers from all around the world. Can you tell me about a time you handled a difficult situation with a customer?`,
      speaker: 'Store Manager',
      durationSeconds: 25,
      questions: [
        {
          id: 'q1',
          prompt: 'What kind of work environment is described?',
          options: ['Quiet and isolated', 'Fast-paced and international', 'Slow and predictable', 'Strict and silent'],
          correct: 'Fast-paced and international',
          explanation: 'The manager specifically seeks someone who thrives in a "fast-paced environment".',
        },
      ],
    },
    {
      id: 'listen-b2-tech-podcast',
      level: 'B2',
      title: 'Tech Innovations in South Florida',
      audioSpeakerText: `Miami has rapidly evolved from a sun-drenched tourist haven into a vibrant technology hub. Startups from fintech to artificial intelligence are setting down roots here, drawn by favorable tax incentives, cultural diversity, and unmatched international connectivity.`,
      speaker: 'Podcast Host',
      durationSeconds: 35,
      questions: [
        {
          id: 'q1',
          prompt: 'According to the speaker, what is attracting tech startups to Miami?',
          options: [
            'Favorable tax incentives and international connectivity',
            'Cheaper office furniture',
            'Colder weather conditions',
            'Government mandates',
          ],
          correct: 'Favorable tax incentives and international connectivity',
          explanation: 'The passage highlights tax incentives, cultural diversity, and international connectivity.',
        },
      ],
    },
  ];

  return NextResponse.json({ modules: listeningModules });
}
