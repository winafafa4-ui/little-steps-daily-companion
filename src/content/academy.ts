// Offline Academy content: 10 lessons on the science-informed practice of
// building discipline. Every claim stays accurate — no miracle day-counts,
// no fabricated statistics. Quizzes check understanding, not trivia.

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  tagline: string;
  minutes: number;
  sections: { heading: string; body: string }[];
  takeaways: string[];
  quiz: QuizQuestion[];
}

export const LESSONS: Lesson[] = [
  {
    id: "habit-loop",
    title: "The Habit Loop",
    category: "Foundations",
    tagline: "Cue, routine, reward — the engine behind every automatic behavior",
    minutes: 6,
    sections: [
      {
        heading: "Every habit has a shape",
        body: "Researchers describe habits as a loop: a cue in your environment triggers a routine (the behavior), which delivers some kind of reward. The more a cue and behavior are paired, and the more satisfying the result, the more automatic the behavior becomes. Over time the decision moves from deliberate thought toward autopilot — that's what makes habits both powerful and hard to notice.",
      },
      {
        heading: "Why this matters for discipline",
        body: "Discipline is easier when you stop relying on raw willpower in the moment and start engineering the loop instead. Ask of any habit you want: What will cue it? What exactly will I do? What makes it satisfying right away? Ask of any habit you want to break: What cue starts it, and what need does it meet?",
      },
      {
        heading: "A honest caveat",
        body: "Behavior science still debates exactly how habits form and how long it takes — it varies widely by person and behavior. What is well supported: repetition in a consistent context builds automaticity, and immediate rewards strengthen the loop. There is no fixed number of days that guarantees a habit is permanent.",
      },
    ],
    takeaways: [
      "Habits run on a cue → routine → reward loop, not on motivation alone.",
      "Design the cue and the immediate reward instead of relying on willpower in the moment.",
      "Repetition in a consistent context builds automaticity — there is no guaranteed day count.",
    ],
    quiz: [
      {
        q: "What are the three parts of the classic habit loop?",
        options: ["Goal, effort, success", "Cue, routine, reward", "Thought, feeling, action", "Plan, execute, review"],
        correct: 1,
        why: "A cue triggers the routine (the behavior), and the routine's result acts as a reward that reinforces the loop.",
      },
      {
        q: "Which statement about habit formation is accurate?",
        options: [
          "21 days makes any habit permanent",
          "Automaticity develops at the same speed for everyone",
          "Repetition in a consistent context gradually builds automaticity",
          "Habits form instantly when motivation is high",
        ],
        correct: 2,
        why: "Automaticity grows with repetition in a consistent context, and the timeline varies widely between people and behaviors.",
      },
    ],
  },
  {
    id: "if-then-plans",
    title: "If-Then Plans",
    category: "Foundations",
    tagline: "Pre-deciding when, where, and how you'll act",
    minutes: 5,
    sections: [
      {
        heading: "The plan does the deciding",
        body: "A habit goal like \"I'll exercise more\" leaves a hundred small decisions open: when, where, what, how long. An implementation intention closes them: \"If it is 7:00 a.m., then I will put on my running shoes and walk for 15 minutes around the block.\" You decide once, in advance, instead of renegotiating with yourself every day.",
      },
      {
        heading: "What the research says",
        body: "Implementation intentions — if-then plans linking a concrete situation to a concrete action — have been studied for decades, and meta-analyses find they reliably increase the odds of follow-through across many domains, with effects that vary in size. They work because they hand control of the action to a situation you'll actually encounter, rather than to a vague intention.",
      },
      {
        heading: "How to write a good one",
        body: "Use a cue that is specific, reliable, and part of your day: a time, a place, or an event that already happens (\"after I pour my morning coffee\"). Name one concrete action, not a category. \"If it's 12:30, then I eat the lunch I packed\" beats \"if I'm hungry, then I'll eat something healthy.\"",
      },
    ],
    takeaways: [
      "Vague goals leave decisions open every day; if-then plans close them in advance.",
      "Tie the plan to a specific, reliable cue — a time, place, or event that already happens.",
      "Name one concrete action, not a category.",
    ],
    quiz: [
      {
        q: "Which is the strongest implementation intention?",
        options: [
          "I'll try to read more when I feel like it",
          "If it is 9:30 p.m., then I will read two pages of my book in bed",
          "Reading is important to me, so I'll do it more",
          "I will become a person who reads daily",
        ],
        correct: 1,
        why: "It links a specific, reliable cue (9:30 p.m.) to one concrete action (two pages, in bed).",
      },
    ],
  },
  {
    id: "habit-stacking",
    title: "Habit Stacking",
    category: "Foundations",
    tagline: "Attach new habits to routines you already have",
    minutes: 4,
    sections: [
      {
        heading: "Borrow an anchor",
        body: "Your existing routines are chains of behaviors that already run on autopilot: waking up, brushing your teeth, making coffee, arriving home. Each link can serve as a reliable cue for a new habit. \"After I brush my teeth, then I will do two minutes of stretching\" — the established habit becomes the trigger, so you don't need a new reminder or a fresh decision point.",
      },
      {
        heading: "Keep the chain short and honest",
        body: "Stack one new habit onto one anchor at a time, and pick anchors that happen every day without exception. If the stack keeps failing, the anchor is probably unreliable (it depends on someone else, or only happens on workdays) or the new habit is too big for that slot in your day.",
      },
    ],
    takeaways: [
      "Anchor new habits to existing daily behaviors instead of creating new reminders.",
      "One new habit per anchor, and only anchors that happen every day.",
    ],
    quiz: [
      {
        q: "What makes a good anchor for habit stacking?",
        options: [
          "Something you do most weekends",
          "Something that happens daily without exception",
          "Something your friend does",
          "Something you wish you did",
        ],
        correct: 1,
        why: "The anchor's job is to be a reliable trigger — if it doesn't happen, neither does the new habit.",
      },
    ],
  },
  {
    id: "environment-design",
    title: "Design Your Environment",
    category: "Systems",
    tagline: "Make good behaviors easy and bad ones hard",
    minutes: 5,
    sections: [
      {
        heading: "Friction cuts both ways",
        body: "Every action has a cost — time, effort, distance, decisions. Add a little friction to behaviors you want less of (phone in another room, snacks out of sight, games logged out) and remove friction from behaviors you want more of (workout clothes laid out the night before, book on the pillow, water bottle filled on the desk). Small changes in distance and visibility reliably shift behavior.",
      },
      {
        heading: "One decision, many repetitions",
        body: "The appeal of environment design is that a single change keeps working: move the phone once and every evening afterward is slightly easier to protect. Compared to in-the-moment willpower — which degrades when you're tired or stressed — rearranged surroundings are patient.",
      },
      {
        heading: "Audit your spaces",
        body: "Pick one behavior you keep failing at and trace it back to its environment. Where does the cue live? What objects make it easy? Then change the space before you blame your character. Most relapses are logistics problems in disguise.",
      },
    ],
    takeaways: [
      "Reduce friction for habits you want; add friction for habits you don't.",
      "One environmental change keeps paying off across many repetitions.",
      "When behavior fails, check the environment before blaming willpower.",
    ],
    quiz: [
      {
        q: "You keep scrolling in bed until midnight. What's an environment-design fix?",
        options: [
          "Try harder tonight",
          "Charge your phone outside the bedroom and keep a book on the nightstand",
          "Download an app to track your guilt",
          "Promise yourself it's the last time",
        ],
        correct: 1,
        why: "It adds friction to the unwanted behavior (phone out of reach) and removes friction from the desired one (book within reach).",
      },
    ],
  },
  {
    id: "start-small",
    title: "Start Small",
    category: "Systems",
    tagline: "Minimum viable habits that survive bad days",
    minutes: 5,
    sections: [
      {
        heading: "The floor matters more than the ceiling",
        body: "Ambitious plans feel motivating on day one and become traps by day nine. A habit you can complete on your worst day — two pages, one push-up, a five-minute tidy — protects the streak and the identity. Volume can grow later; showing up is the skill you're training first.",
      },
      {
        heading: "Why small works",
        body: "A tiny habit lowers the activation cost so far that starting no longer requires motivation. It also keeps the reward loop intact: every day you finish, the loop closes with success instead of guilt. Missing at the minimum dose is rare — and when it happens, it's a scheduling problem, not a character flaw.",
      },
      {
        heading: "Scale with difficulty levels",
        body: "This app uses three difficulty levels for a reason. Keep a Minimum version you can always do, a Standard version for a normal day, and an Advanced version for when energy allows. Doing the minimum on a hard day is a win with full credit — it counts as done.",
      },
    ],
    takeaways: [
      "Define a minimum dose you can complete on your worst day.",
      "Tiny habits keep the reward loop closing with success, not guilt.",
      "On hard days, the minimum counts fully as done.",
    ],
    quiz: [
      {
        q: "Your habit's minimum version exists mainly to…",
        options: [
          "Make you feel bad when you're lazy",
          "Replace the real habit",
          "Guarantee you can keep showing up even on bad days",
          "Impress people with your discipline",
        ],
        correct: 2,
        why: "The minimum protects consistency — the skill you're actually training — when time, energy, or mood are low.",
      },
    ],
  },
  {
    id: "self-monitoring",
    title: "Track It",
    category: "Systems",
    tagline: "Measurement changes the behavior it measures",
    minutes: 4,
    sections: [
      {
        heading: "The self-monitoring effect",
        body: "Reviews of goal-pursuit research (including a large meta-analysis by Harkin and colleagues) found that regularly monitoring progress substantially increases the odds of reaching goals. Seeing the record — a streak, a filled square, a rising line — gives you information you otherwise guess at, and a small visible reward every time you log.",
      },
      {
        heading: "Track the minimum you'll maintain",
        body: "Tracking is itself a habit. If logging feels like a chore, you'll stop, and then the system stops with it. A single tap per habit — what this app uses — beats elaborate spreadsheets you abandon in a week. Track the handful of habits that matter; a dashboard full of noise helps nobody.",
      },
    ],
    takeaways: [
      "Monitoring progress reliably improves goal attainment across studies.",
      "Keep tracking friction low — one tap beats abandoned elaborate systems.",
    ],
    quiz: [
      {
        q: "What does research on self-monitoring suggest?",
        options: [
          "Tracking your progress makes you more likely to reach your goals",
          "Tracking only works for athletes",
          "Tracking replaces the need to act",
          "Tracking reliably makes people obsessive",
        ],
        correct: 0,
        why: "Meta-analytic evidence (e.g., Harkin et al., 2009) shows progress monitoring promotes goal attainment.",
      },
    ],
  },
  {
    id: "procrastination",
    title: "Understanding Procrastination",
    category: "Focus",
    tagline: "Why we delay — and the five-minute counterattack",
    minutes: 6,
    sections: [
      {
        heading: "It's about feelings, not clocks",
        body: "Procrastination is delaying an intended action, usually in favor of something mood-repairing. Research links it to tasks that feel aversive — boring, frustrating, ambiguous, or threatening to fail at — and to our tendency to discount future rewards. Your brain trades a guaranteed small relief now against a distant benefit, and the distant benefit loses.",
      },
      {
        heading: "Shrink the start",
        body: "The reliable counterattack is lowering the entry cost until starting beats avoiding. Commit to five minutes — genuinely five, with permission to stop. Most of the aversion lives in the anticipation, not the task; once you're moving, continuing is much cheaper than stopping. Pair it with breaking the task into a first concrete step: \"open the document and write one ugly sentence.\"",
      },
      {
        heading: "Remove the negotiation",
        body: "Decide in advance when and where the task starts (an if-then plan), and make the distraction harder to reach. Every time you renegotiate with yourself, you lose. A pre-committed start time turns \"should I do it now?\" — a question you can lose — into \"it's 9:00, that's when it starts.\"",
      },
    ],
    takeaways: [
      "Procrastination is mood repair: we avoid tasks that feel aversive and favor immediate relief.",
      "Commit to a genuine five-minute start; anticipation is usually worse than the task.",
      "Pre-commit with an if-then plan so there is nothing to renegotiate.",
    ],
    quiz: [
      {
        q: "Why does the 'just five minutes' technique work?",
        options: [
          "It tricks you into a full workday, always",
          "Most of the aversion is in anticipation, which drops once you start",
          "Five minutes is the scientifically perfect length",
          "It makes the task smaller permanently",
        ],
        correct: 1,
        why: "The dread of starting is often worse than the task itself; once you begin, continuing is cheaper than stopping.",
      },
    ],
  },
  {
    id: "motivation-follows-action",
    title: "Motivation Follows Action",
    category: "Focus",
    tagline: "Don't wait to feel like it — act, and the feeling comes",
    minutes: 4,
    sections: [
      {
        heading: "The wrong order",
        body: "We tend to assume motivation leads and action follows: feel inspired, then work. In practice the causality usually runs the other way. Starting — even at a trivial level — changes your state: momentum, small wins, and a settled mind generate the energy you were waiting for. Behavior therapists have used this for decades: schedule the action, let the mood catch up.",
      },
      {
        heading: "Build systems, not moods",
        body: "Motivation is a fine bonus but a terrible foundation, because it fluctuates with sleep, stress, and weather. Systems — fixed times, if-then plans, tiny minimums, environments arranged in advance — don't care how you feel. Let motivation multiply your system on good days, never substitute for it on bad ones.",
      },
    ],
    takeaways: [
      "Action usually creates motivation, not the reverse.",
      "Fixed times, plans, and minimums keep you going when motivation doesn't show up.",
    ],
    quiz: [
      {
        q: "The most dependable order of operations is…",
        options: [
          "Wait for motivation, then act",
          "Act at a pre-committed time, then let motivation follow",
          "Act only on special occasions",
          "Motivation and action are unrelated",
        ],
        correct: 1,
        why: "Starting at a pre-committed time — however small — reliably generates the momentum you were waiting for.",
      },
    ],
  },
  {
    id: "body-foundation",
    title: "The Body Foundation",
    category: "Health",
    tagline: "Sleep and movement are discipline multipliers",
    minutes: 6,
    sections: [
      {
        heading: "Self-regulation runs on a body",
        body: "Every habit you're building is executed by a biological system. Short or irregular sleep is associated with worse impulse control, mood, and attention the next day — which makes every other discipline harder. Regular physical activity is consistently associated with better mood, energy, and stress tolerance. These aren't magic, and effects vary between people, but the direction is clear: a rested, moving body makes discipline cheaper.",
      },
      {
        heading: "Protect the basics first",
        body: "If everything is collapsing at once, stabilize in this order: a consistent sleep and wake time, some daily movement (even a walk), regular meals. Chasing advanced productivity systems on four hours of sleep is building on sand. Treat your wake time and bedtime as the load-bearing walls of the whole structure.",
      },
      {
        heading: "One honest note",
        body: "You'll see self-control described as a 'muscle' that runs out like fuel in older writing. Modern evidence suggests it's more complicated — beliefs, motivation, and context matter a lot. The practical takeaway stands either way: don't schedule your hardest habit at your lowest-energy hour, and don't plan important decisions right after a draining day.",
      },
    ],
    takeaways: [
      "Consistent sleep and regular movement make every other habit easier.",
      "Stabilize sleep, movement, and meals before adding advanced systems.",
      "Schedule demanding habits during your natural high-energy hours.",
    ],
    quiz: [
      {
        q: "Why does a consistent wake time come first when rebuilding discipline?",
        options: [
          "It's a popular trend",
          "Sleep regularity supports the impulse control and energy every other habit depends on",
          "It burns the most calories",
          "It replaces the need for habits",
        ],
        correct: 1,
        why: "Sleep regularity is associated with better self-regulation, mood and attention — the raw material of every other habit.",
      },
    ],
  },
  {
    id: "never-miss-twice",
    title: "Never Miss Twice",
    category: "Resilience",
    tagline: "Lapses are data, not verdicts",
    minutes: 5,
    sections: [
      {
        heading: "One miss is a rounding error",
        body: "Everyone who has ever built anything missed days. Illness, travel, deadlines, life. What separates people who keep going from people who stop isn't perfection — it's what the first miss means to them. Read it as a data point (\"what made Tuesday impossible?\") and you adjust and continue. Read it as proof you're \"not the kind of person who…\" and you've handed one bad day your entire identity.",
      },
      {
        heading: "The abstinence violation effect",
        body: "Psychologists call the spiral the abstinence violation effect: a small slip triggers guilt and the thought \"I've blown it, so why bother,\" which produces a much bigger collapse than the slip itself. The rule that prevents it is simple: never miss twice. A missed day is an accident; two is the start of a new (worse) habit.",
      },
      {
        heading: "Self-compassion is a performance strategy",
        body: "Being harsh with yourself after a lapse feels like accountability, but research on self-compassion suggests the opposite: people who respond to setbacks kindly return to their goals more consistently than those who self-criticize. Your score in this app never erases earned XP for missed days — progress here is lifetime, because consistency over months beats perfection over a week.",
      },
    ],
    takeaways: [
      "A missed day is data about your system, not a verdict on you.",
      "Never miss twice: one lapse is an accident, two is a new habit forming.",
      "Self-compassion after setbacks supports returning to your goals.",
    ],
    quiz: [
      {
        q: "What is the 'abstinence violation effect'?",
        options: [
          "Breaking a rule feels so bad that people quit entirely",
          "Breaking a rule once makes the rule stronger",
          "A legal term about contracts",
          "The satisfaction of finally being free of a habit",
        ],
        correct: 0,
        why: "A small slip plus guilt and 'I've blown it' thinking produces a collapse far bigger than the slip itself.",
      },
      {
        q: "The most useful response to a missed day is…",
        options: [
          "Punish yourself with double volume tomorrow",
          "Ignore it and pretend the streak never broke",
          "Find what made it hard, resume the next day, and keep the minimum dose small",
          "Delete the habit and start over from zero",
        ],
        correct: 2,
        why: "Diagnosing the system, resuming quickly, and keeping the bar reachable prevents the second miss.",
      },
    ],
  },
];
