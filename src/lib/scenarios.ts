import type { Category } from "@/types/lesson";

/** Random scenarios per category for auto-fill and "Need an Idea?" */
export const SCENARIOS: Record<Category, string[]> = {
  workplace: [
    "You need to ask your boss for a day off next week.",
    "A coworker keeps interrupting you in meetings. You want to address it politely.",
    "You're in a job interview and they ask: 'Where do you see yourself in five years?'",
    "You have to give a short presentation to your team about a project update.",
    "Your manager gives you feedback you disagree with. You want to respond professionally.",
    "You need to write a brief email declining a meeting invitation.",
  ],
  travel: [
    "You're at the airport and your flight is delayed. You need to ask about alternatives.",
    "You're checking into a hotel and want to request a quiet room.",
    "You're lost in a new city and need to ask a stranger for directions.",
    "You're at a restaurant and need to explain a food allergy to the waiter.",
    "You're renting a car and need to understand the insurance options.",
    "You're at customs and the officer asks about the purpose of your visit.",
  ],
  shopping: [
    "You want to return an item without a receipt. The store has a strict policy.",
    "You're comparing prices and want to ask for a discount or price match.",
    "A salesperson is being very pushy. You want to say no politely.",
    "You're buying a gift and need advice from the clerk.",
    "You received the wrong item in the mail and need to request an exchange.",
    "You're at a checkout and your card is declined. You need to stay calm and fix it.",
  ],
  social: [
    "You're at a party and want to start a conversation with someone you don't know.",
    "A friend invited you to dinner but you need to decline because of a prior commitment.",
    "Someone asks you a personal question you're not comfortable answering.",
    "You want to invite a new colleague to lunch to get to know them.",
    "You're at a networking event and need to introduce yourself briefly.",
    "A neighbor is being noisy late at night. You want to ask them to keep it down.",
  ],
  healthcare: [
    "You're at the pharmacy and need to ask how to take a new medication.",
    "You're calling to make a doctor's appointment and need to describe your symptoms.",
    "You're in the ER waiting room and need to ask how long the wait might be.",
    "You need to explain your medical history to a new doctor.",
    "You're with a family member who doesn't speak English and need to interpret.",
    "You want to request a copy of your medical records.",
  ],
  culture: [
    "Someone asks you about American holidays and what Thanksgiving means to Americans.",
    "You're at a potluck and don't know what dish to bring or how much.",
    "A friend asks why Americans tip so much and how much to leave.",
    "You're discussing small talk and why Americans often ask 'How are you?' without expecting a long answer.",
    "Someone is confused about American units (miles, Fahrenheit, ounces) and you explain.",
    "You're explaining what 'tailgating' or 'Black Friday' means to a newcomer.",
  ],
  job_interview: [
    "The interviewer asks: 'Tell me about yourself.' You give a concise 1–2 minute pitch.",
    "They ask: 'What are your greatest strengths?' You give examples tied to the role.",
    "They ask: 'Why do you want to work here?' You connect your goals to the company.",
    "They ask: 'Where do you see yourself in five years?' You keep it professional and realistic.",
    "The interview is ending. They ask: 'Do you have any questions for us?' You ask 1–2 thoughtful questions.",
    "They ask about a time you dealt with a difficult coworker. You use the STAR method.",
  ],
  sports: [
    "You're at a sports bar and want to order food while watching the game.",
    "A friend asks you to explain the rules of American football.",
    "You're joining a casual soccer league and need to introduce yourself to the team.",
    "Someone asks who you're rooting for in the game. You explain you're a neutral fan.",
    "You're at a stadium and need to find your seat. You ask an usher for help.",
    "A coworker invites you to a tailgate. You're not sure what to bring or when to arrive.",
  ],
};

export function getRandomScenario(category: Category): string {
  const list = SCENARIOS[category];
  return list[Math.floor(Math.random() * list.length)] ?? list[0];
}

/** Get a random scenario from any category (for "Need an Idea?") */
export function getRandomScenarioFromAny(): string {
  const categories = Object.keys(SCENARIOS) as Category[];
  const category = categories[Math.floor(Math.random() * categories.length)];
  return getRandomScenario(category);
}
