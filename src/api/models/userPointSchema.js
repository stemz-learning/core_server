// Define the course templates structure
const courseTemplates = {
  astronomy: {
    title: 'Astronomy',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'The Solar System',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'The Solar System',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'Galaxies',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Space and Humans',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Star Map',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: 'The Universe',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Astronomy Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  basicsOfCoding: {
    title: 'Basics of Coding',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Introduction to Scratch',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'Conditional Statements & Loops',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Wait & Sensors',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: 'Final Review',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Basics of Coding Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  biochemistry: {
    title: 'Biochemistry',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Nucleic Acids',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'Proteins & Carbohydrates',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Proteins and Carbohydrates',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
          quiz: {
            title: 'Biochemistry Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  chemistry: {
    title: 'Chemistry',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Chemistry & Matter',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'Molecules & Atoms',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Chemical Reactions',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: 'Putting It All Together',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Chemistry Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 10,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  circuits: {
    title: 'Circuits',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Circuits & Circuit Boards',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'More Circuit Board Tools',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Circuit Board Tools',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Creating a Functioning Circuit',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Circuit Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 11,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  environmentalScience: {
    title: 'Environmental Science',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Biomes',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Nature Scavenger Hunt',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'Cycles of the Earth',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Population in the Water & Air',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: "3 R's and the Environment",
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Environmental Science Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  psychology: {
    title: 'Psychology',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Psychology & Scientific Method',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Turning the Game into an Experiment',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'How the Brain Works',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'The Math Experiment',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Memory',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: 'Mind Tricks',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Psychology Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  statistics: {
    title: 'Statistics',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Fractions',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Fraction Game',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: 'Advanced Percents',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Advanced Percents',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Fraction Restaurant',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: 'Types of Graphs',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Create Your Own Graph!',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson5: {
        title: 'Surveys & Real World',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Statistics Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
  zoology: {
    title: 'Zoology',
    coursePoints: 0,
    completed: false,
    lessons: {
      lesson1: {
        title: 'Classification & Taxonomy',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Categories',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson2: {
        title: "Darwin's Theory",
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: "Darwin's Theory of Evolution",
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson3: {
        title: 'Distribution',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
        },
      },
      lesson4: {
        title: 'Behavior',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          worksheet: {
            title: 'Animal Behaviors',
            type: 'worksheet',
            completed: false,
            points: 5,
            earned: 0,
          },
        },
      },
      lesson5: {
        title: 'Anatomy & Physiology',
        lessonPoints: 0,
        completed: false,
        activities: {
          video: {
            type: 'video',
            completed: false,
            percentWatched: 0,
            points: 7,
            earned: 0,
          },
          quiz: {
            title: 'Zoology Quiz',
            type: 'quiz',
            completed: false,
            points: 5,
            extraPoints: 5,
            questionsCount: 14,
            correctAnswers: 0,
            percentCorrect: 0,
            earned: 0,
          },
        },
      },
    },
  },
};

// Function to create initial user progress template
function createUserProgressTemplate() {
  return {
    totalPoints: 0,
    courses: courseTemplates,
    syncInfo: {
      lastSyncedAt: null,
      syncStatus: 'initial',
    },
  };
}

module.exports = {
  courseTemplates,
  createUserProgressTemplate,
};
