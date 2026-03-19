import prisma from '../config/database.js';

/**
 * Default tasks to seed for new child profiles
 * Based on the original MotivTrack UI design
 */
const DEFAULT_TASKS = [
  {
    title: 'Take out trash',
    icon: '🗑️',
    doneStandard: 'Remove the full bag, tie it, take it outside, and put a new liner in.',
    extraWellDoneStandard: 'All indoor bins checked, liner fitted neatly, bin wiped clean.',
    tips: [
      'Tie the bag tight so nothing spills on the way out',
      'Check if other bins need emptying too',
      'New liners are under the kitchen sink',
    ],
    pointsDone: 1,
    pointsExtraWellDone: 0.5,
  },
  {
    title: 'Clean bathroom sink',
    icon: '🚰',
    doneStandard: 'Wipe the basin, faucet, and counter with a damp cloth and cleaner.',
    extraWellDoneStandard: 'Basin spotless, faucet shiny, counter clear, mirror wiped.',
    tips: [
      'Use the spray cleaner under the sink',
      'Don\'t forget to wipe the faucet handles',
      'Rinse the cloth when it gets dirty',
    ],
    pointsDone: 2,
    pointsExtraWellDone: 1,
  },
  {
    title: 'Complete homework',
    icon: '📚',
    doneStandard: 'Finish all assigned work for every subject, showing your work where needed.',
    extraWellDoneStandard: 'All work complete, neat handwriting, extra problems attempted.',
    tips: [
      'Start with the hardest subject first',
      'Take a 5-minute break between subjects',
      'Ask for help if you\'re stuck',
    ],
    pointsDone: 3,
    pointsExtraWellDone: 1.5,
  },
  {
    title: 'Make bed',
    icon: '🛏️',
    doneStandard: 'Pull up the sheets and duvet, straighten pillows, make it look tidy.',
    extraWellDoneStandard: 'Sheets smooth, pillows arranged, stuffed animals placed nicely.',
    tips: [
      'Pull the sheets tight from all corners',
      'Fluff the pillows before placing them',
      'Straighten the duvet so it hangs evenly',
    ],
    pointsDone: 1,
    pointsExtraWellDone: 0.5,
  },
  {
    title: 'Load dishwasher',
    icon: '🍽️',
    doneStandard: 'Load dirty dishes, add tablet, run a cycle if full.',
    extraWellDoneStandard: 'Dishes rinsed, organized efficiently, counters wiped, cycle started.',
    tips: [
      'Rinse off big food chunks first',
      'Put plates in the back, bowls in front',
      'Make sure nothing blocks the spinner',
    ],
    pointsDone: 2,
    pointsExtraWellDone: 1,
  },
  {
    title: 'Feed the dog',
    icon: '🐕',
    doneStandard: 'Give the right amount of food morning and evening, top up water bowl.',
    extraWellDoneStandard: 'Food measured, bowls cleaned, water fresh, feeding area tidy.',
    tips: [
      'Use the measuring cup in the food bin',
      'Wash the bowls if they\'re dirty',
      'Make sure the water is fresh',
    ],
    pointsDone: 1,
    pointsExtraWellDone: 0.5,
  },
];

/**
 * Default rewards to seed for new child profiles
 */
const DEFAULT_REWARDS = [
  {
    title: 'Pizza Night',
    icon: '🍕',
    pointsCost: 10,
    category: 'FOOD',
    needsScheduling: false,
  },
  {
    title: 'Extra Screen Time',
    icon: '🎮',
    pointsCost: 8,
    category: 'FREE_TIME',
    needsScheduling: false,
  },
  {
    title: 'Movie Pick',
    icon: '🎬',
    pointsCost: 6,
    category: 'ACTIVITY',
    needsScheduling: true,
  },
  {
    title: '$5 Cash',
    icon: '💵',
    pointsCost: 12,
    category: 'MONEY',
    needsScheduling: false,
  },
  {
    title: 'Hobby Supplies',
    icon: '🎨',
    pointsCost: 15,
    category: 'SUPPLIES',
    needsScheduling: false,
  },
  {
    title: 'Sleep-In Pass',
    icon: '😴',
    pointsCost: 5,
    category: 'FREE_TIME',
    needsScheduling: false,
  },
];

export class SeedService {
  /**
   * Seed default tasks for a new child profile
   */
  static async seedDefaultTasks(childProfileId: string, createdBy: string) {
    const tasks = await Promise.all(
      DEFAULT_TASKS.map((task) =>
        prisma.task.create({
          data: {
            childProfileId,
            title: task.title,
            icon: task.icon,
            doneStandard: task.doneStandard,
            extraWellDoneStandard: task.extraWellDoneStandard,
            tips: task.tips,
            pointsDone: task.pointsDone,
            pointsExtraWellDone: task.pointsExtraWellDone,
            isFromLibrary: false,
            createdBy,
          },
        })
      )
    );

    return tasks;
  }

  /**
   * Seed default rewards for a new child profile
   */
  static async seedDefaultRewards(childProfileId: string, createdBy: string) {
    const rewards = await Promise.all(
      DEFAULT_REWARDS.map((reward) =>
        prisma.reward.create({
          data: {
            childProfileId,
            title: reward.title,
            icon: reward.icon,
            pointsCost: reward.pointsCost,
            category: reward.category,
            needsScheduling: reward.needsScheduling,
            isActive: true,
            createdBy,
          },
        })
      )
    );

    return rewards;
  }

  /**
   * Seed both tasks and rewards for a new child profile
   */
  static async seedDefaultData(childProfileId: string, createdBy: string) {
    const [tasks, rewards] = await Promise.all([
      this.seedDefaultTasks(childProfileId, createdBy),
      this.seedDefaultRewards(childProfileId, createdBy),
    ]);

    return { tasks, rewards };
  }
}
