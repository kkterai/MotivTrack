import prisma from '../config/database.js';

export class LibraryService {
  /**
   * Get all library tasks
   */
  static async getAllLibraryTasks(category?: string) {
    const tasks = await prisma.libraryTask.findMany({
      where: {
        isArchived: false,
        category: category as any,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return tasks;
  }

  /**
   * Get library task by ID
   */
  static async getLibraryTaskById(taskId: string) {
    const task = await prisma.libraryTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Library task not found');
    }

    return task;
  }

  /**
   * Get library tasks by category
   */
  static async getTasksByCategory(category: string) {
    const tasks = await prisma.libraryTask.findMany({
      where: {
        category: category as any,
        isArchived: false,
      },
      orderBy: {
        title: 'asc',
      },
    });

    return tasks;
  }

  /**
   * Search library tasks
   */
  static async searchTasks(query: string) {
    const tasks = await prisma.libraryTask.findMany({
      where: {
        isArchived: false,
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        title: 'asc',
      },
    });

    return tasks;
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    const categories = await prisma.libraryTask.groupBy({
      by: ['category'],
      where: {
        isArchived: false,
      },
      _count: {
        category: true,
      },
    });

    return categories.map((c) => ({
      category: c.category,
      count: c._count.category,
    }));
  }

  /**
   * Seed the library with curated tasks from the PRD
   * This should be run once during initial setup
   */
  static async seedLibrary() {
    const libraryTasks = [
      // Kitchen tasks
      {
        title: 'Load dishwasher',
        description: 'Load dirty dishes, add a tablet, and run a cycle if full.',
        doneStandard: 'All dishes loaded, tablet in, cycle started.',
        extraWellDoneStandard: 'Sink wiped down, counter cleared, previous clean load put away.',
        tips: JSON.stringify([
          'Scrape food into the bin first',
          'Cups go upside down on the top rack',
          'Check the tablet dispenser before adding one',
        ]),
        suggestedPointsDone: 2,
        suggestedPointsExtraWellDone: 3,
        category: 'kitchen',
      },
      {
        title: 'Take out trash',
        description: 'Remove the full bag, tie it, take it outside, and put a new liner in.',
        doneStandard: 'Bag removed, tied, taken outside, new liner in place.',
        extraWellDoneStandard: 'All indoor bins checked, liner fitted neatly, bin wiped down.',
        tips: JSON.stringify([
          'Tie the bag tight so nothing spills on the way out',
          'Check if other bins need emptying too',
          'New liners are under the kitchen sink',
        ]),
        suggestedPointsDone: 1,
        suggestedPointsExtraWellDone: 2,
        category: 'kitchen',
      },

      // Bathroom tasks
      {
        title: 'Clean bathroom sink',
        description: 'Wipe the basin, faucet, and counter with a damp cloth and cleaner.',
        doneStandard: 'Basin wiped clean, no soap residue, faucet wiped.',
        extraWellDoneStandard: 'Counter cleared, mirror spot-cleaned, fresh hand towel put out.',
        tips: JSON.stringify([
          'Spray cleaner and let it sit 30 sec before wiping',
          'Use a dry cloth at the end so it shines',
          "Don't forget the faucet handles",
        ]),
        suggestedPointsDone: 2,
        suggestedPointsExtraWellDone: 3,
        category: 'bathroom',
      },

      // Bedroom tasks
      {
        title: 'Make bed',
        description: 'Pull up the sheets and duvet, straighten pillows, make it look tidy.',
        doneStandard: 'Duvet up and flat, pillows in place, no clothes on bed.',
        extraWellDoneStandard: 'Sheets tucked in, pillows arranged, clutter cleared around bed.',
        tips: JSON.stringify([
          'Pull the sheet tight before doing the duvet',
          'Fluff pillows by punching them a couple times',
          'It only takes 2 minutes once you get fast!',
        ]),
        suggestedPointsDone: 1,
        suggestedPointsExtraWellDone: 2,
        category: 'bedroom',
      },
      {
        title: 'Tidy bedroom',
        description: 'Put clothes away, clear floor, organize desk.',
        doneStandard: 'Floor clear, clothes in hamper or closet, desk surface visible.',
        extraWellDoneStandard: 'Desk organized, books on shelf, bed made, surfaces dusted.',
        tips: JSON.stringify([
          'Start with the floor - pick up everything',
          'Dirty clothes go in hamper, clean clothes in closet',
          'Use a box for random items to sort later',
        ]),
        suggestedPointsDone: 2,
        suggestedPointsExtraWellDone: 3,
        category: 'bedroom',
      },

      // Laundry tasks
      {
        title: 'Fold and put away laundry',
        description: 'Fold clean clothes and put them in drawers or closet.',
        doneStandard: 'All clothes folded and put away in correct places.',
        extraWellDoneStandard: 'Clothes neatly folded, drawers organized, hangers used properly.',
        tips: JSON.stringify([
          'Fold on a flat surface like a bed',
          'Group by type: shirts, pants, socks',
          'Hang items that wrinkle easily',
        ]),
        suggestedPointsDone: 2,
        suggestedPointsExtraWellDone: 3,
        category: 'laundry',
      },

      // Outdoor tasks
      {
        title: 'Water plants',
        description: 'Water all indoor and outdoor plants that need it.',
        doneStandard: 'All plants watered, no dry soil.',
        extraWellDoneStandard: 'Plants watered, dead leaves removed, pots wiped clean.',
        tips: JSON.stringify([
          'Check soil with your finger - if dry, water it',
          'Water until it drains from the bottom',
          'Morning is the best time to water',
        ]),
        suggestedPointsDone: 1,
        suggestedPointsExtraWellDone: 2,
        category: 'outdoor',
      },

      // General tasks
      {
        title: 'Complete homework',
        description: 'Finish all assigned work for every subject, showing your work where needed.',
        doneStandard: 'All assignments done, name on each page, packed in bag.',
        extraWellDoneStandard: 'Work double-checked, assignments organized by subject.',
        tips: JSON.stringify([
          'Start with the hardest subject first',
          'Try 25 min work + 5 min break (Pomodoro)',
          'Write each subject down as you finish it',
        ]),
        suggestedPointsDone: 3,
        suggestedPointsExtraWellDone: 4,
        category: 'general',
      },
      {
        title: 'Feed the pet',
        description: 'Give the right amount of food morning and evening, top up water bowl.',
        doneStandard: 'Food given both meals, water bowl checked and refilled.',
        extraWellDoneStandard: 'Bowls rinsed and refilled (not just topped up).',
        tips: JSON.stringify([
          'One full scoop per meal — scoop is in the food bag',
          'Check the water bowl every time, not just when empty',
          'Tell a parent if the pet skipped a meal',
        ]),
        suggestedPointsDone: 1,
        suggestedPointsExtraWellDone: 2,
        category: 'general',
      },
    ];

    // Check if library is already seeded
    const existingCount = await prisma.libraryTask.count();

    if (existingCount > 0) {
      return {
        message: 'Library already seeded',
        count: existingCount,
      };
    }

    // Create all library tasks
    const created = await prisma.libraryTask.createMany({
      data: libraryTasks,
    });

    return {
      message: 'Library seeded successfully',
      count: created.count,
    };
  }
}
