export type NormalizedPoint = readonly [number, number];

export type TaskOverlay =
  | { type: "line"; points: readonly [NormalizedPoint, NormalizedPoint] }
  | { type: "arrow"; from: NormalizedPoint; to: NormalizedPoint }
  | { type: "outline"; points: readonly NormalizedPoint[] };

export type TaskStep = {
  n: number;
  say: string;
  cheer?: string;
  overlay: readonly TaskOverlay[];
};

export type TaskPack = {
  id: "crane" | "plane" | "napkin";
  title: string;
  emoji: string;
  xp: number;
  description: string;
  steps: readonly TaskStep[];
};

export const taskPacks: readonly TaskPack[] = [
  {
    id: "crane",
    title: "Paper Crane",
    emoji: "🕊",
    xp: 50,
    description: "A calm, camera-guided first fold.",
    steps: [
      {
        n: 1,
        say: "Place your square paper flat, colour side down, inside the frame.",
        cheer: "Perfect. Let's begin!",
        overlay: [
          {
            type: "outline",
            points: [
              [0.28, 0.3],
              [0.72, 0.3],
              [0.72, 0.74],
              [0.28, 0.74],
            ],
          },
        ],
      },
      {
        n: 2,
        say: "Fold corner to corner on this diagonal, press the crease, then open it again.",
        cheer: "Crisp fold — nice!",
        overlay: [
          { type: "line", points: [[0.28, 0.3], [0.72, 0.74]] },
          { type: "arrow", from: [0.62, 0.34], to: [0.4, 0.6] },
        ],
      },
      {
        n: 3,
        say: "Make the second diagonal crease, then unfold the paper flat.",
        cheer: "You found the base lines!",
        overlay: [
          { type: "line", points: [[0.72, 0.3], [0.28, 0.74]] },
          { type: "arrow", from: [0.38, 0.34], to: [0.6, 0.6] },
        ],
      },
      {
        n: 4,
        say: "Flip the sheet. Fold it edge to edge both ways, then open the creases.",
        cheer: "Your paper is really taking shape.",
        overlay: [
          { type: "line", points: [[0.28, 0.52], [0.72, 0.52]] },
          { type: "line", points: [[0.5, 0.3], [0.5, 0.74]] },
        ],
      },
      {
        n: 5,
        say: "Bring the corners inward to collapse the paper into a square base. Your crane has begun.",
        cheer: "It's a crane! You did it!",
        overlay: [
          { type: "arrow", from: [0.3, 0.34], to: [0.5, 0.7] },
          { type: "arrow", from: [0.7, 0.34], to: [0.5, 0.7] },
        ],
      },
    ],
  },
  {
    id: "plane",
    title: "Paper Airplane",
    emoji: "✈",
    xp: 30,
    description: "A quick route from flat sheet to flight.",
    steps: [
      {
        n: 1,
        say: "Fold the sheet in half lengthwise, then open it to leave a centre crease.",
        cheer: "A clean centre line!",
        overlay: [{ type: "line", points: [[0.5, 0.28], [0.5, 0.76]] }],
      },
      {
        n: 2,
        say: "Bring both top corners into the centre line to make a point.",
        cheer: "Pointy and precise!",
        overlay: [
          { type: "arrow", from: [0.34, 0.3], to: [0.5, 0.4] },
          { type: "arrow", from: [0.66, 0.3], to: [0.5, 0.4] },
        ],
      },
      {
        n: 3,
        say: "Fold the wings down along these lines. Ready for takeoff.",
        cheer: "Ready for takeoff!",
        overlay: [
          { type: "line", points: [[0.5, 0.34], [0.3, 0.72]] },
          { type: "line", points: [[0.5, 0.34], [0.7, 0.72]] },
        ],
      },
    ],
  },
  {
    id: "napkin",
    title: "Napkin Rose",
    emoji: "🌹",
    xp: 30,
    description: "A simple table detail, one motion at a time.",
    steps: [
      {
        n: 1,
        say: "Lay the napkin flat and roll it loosely from this corner.",
        cheer: "A gentle roll is perfect.",
        overlay: [{ type: "arrow", from: [0.32, 0.36], to: [0.66, 0.62] }],
      },
      {
        n: 2,
        say: "Keep rolling into a loose cylinder, then twist the base here.",
        cheer: "Lovely. Now give it a base.",
        overlay: [{ type: "line", points: [[0.42, 0.66], [0.58, 0.66]] }],
      },
      {
        n: 3,
        say: "Open the outer layers into petals. Your napkin rose is ready.",
        cheer: "A rose for the table!",
        overlay: [
          { type: "arrow", from: [0.5, 0.56], to: [0.38, 0.44] },
          { type: "arrow", from: [0.5, 0.56], to: [0.62, 0.44] },
        ],
      },
    ],
  },
];
