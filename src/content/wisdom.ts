// Daily Wisdom: real, attributable quotes — shown one per day on the dashboard.

export const WISDOM: { text: string; source: string }[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", source: "Will Durant, on Aristotle" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", source: "Seneca" },
  { text: "No person is free who is not master of themselves.", source: "Epictetus" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", source: "James Clear" },
  { text: "Small deeds done are better than great deeds planned.", source: "Peter Marshall" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", source: "Dale Carnegie" },
  { text: "A year from now you may wish you had started today.", source: "Karen Lamb" },
  { text: "Motivation gets you going, but discipline keeps you growing.", source: "John C. Maxwell" },
  { text: "Well begun is half done.", source: "Aristotle" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose.", source: "Attributed to Viktor Frankl" },
  { text: "First we make our habits, then our habits make us.", source: "Attributed to John Dryden" },
  { text: "The secret of getting ahead is getting started.", source: "Attributed to Mark Twain" },
];

export function wisdomForToday(todayIndex = new Date().getDate() + new Date().getMonth() * 31) {
  return WISDOM[todayIndex % WISDOM.length] ?? WISDOM[0]!;
}
