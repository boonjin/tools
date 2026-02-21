(function () {
  "use strict";

  var BOOK_META = {
    title: "PSLE English Mastery Textbook",
    totalPages: 1000,
    level: "Primary 5 to Primary 6",
    exam: "PSLE English (Singapore)"
  };

  var WEAK_TAGS = [
    "function_words",
    "collocation_prep",
    "sva",
    "past_perfect",
    "modal_should",
    "connector_contrast_condition",
    "phrasal_verbs"
  ];

  var TAG_RULES = {
    function_words: {
      label: "Function Words",
      goal: "spot what word class the blank needs before picking an answer",
      teach: "Look one word before and one word after the blank. The nearby words usually tell you whether you need an article, a helping verb, a preposition, or a connector.",
      mistake: "Choosing a fancy word without checking the grammar signal beside the blank.",
      recap: "Signal first, answer second."
    },
    collocation_prep: {
      label: "Collocations and Prepositions",
      goal: "use fixed word chunks such as 'in the face of' and 'to pieces'",
      teach: "Some words travel together as a team. Learn these chunks as one unit so you do not swap the preposition.",
      mistake: "Using a random preposition that sounds close but breaks the fixed phrase.",
      recap: "Chunks stay together."
    },
    sva: {
      label: "Subject-Verb Agreement",
      goal: "match the verb to the real subject, even in long noun phrases",
      teach: "Find the main subject first. Ignore extra words in the middle, then decide singular or plural.",
      mistake: "Looking at the nearest noun instead of the real subject.",
      recap: "Find the boss noun first."
    },
    past_perfect: {
      label: "Past Perfect",
      goal: "show the earlier action in a past timeline using 'had + past participle'",
      teach: "When two actions are in the past, mark the earlier one with past perfect to make the timeline clear.",
      mistake: "Using present perfect in a story that is fully in the past.",
      recap: "Earlier past action = had + verb."
    },
    modal_should: {
      label: "Modals (Should)",
      goal: "use 'should' correctly for advice and conditional warnings",
      teach: "In PSLE items, 'should' often appears in advice or 'in case' patterns, such as 'Should a fire break out...'.",
      mistake: "Picking 'shall' because it sounds formal even when the structure needs 'should'.",
      recap: "Should for advice and conditional warning."
    },
    connector_contrast_condition: {
      label: "Connectors",
      goal: "choose connectors by logic and grammar form",
      teach: "Ask what relationship is needed: contrast, reason, time, or condition. Then check if the option fits the sentence structure.",
      mistake: "Mixing up contrast words and condition words.",
      recap: "Meaning and grammar must both fit."
    },
    phrasal_verbs: {
      label: "Phrasal Verbs",
      goal: "read verb + particle as one meaning unit",
      teach: "The particle changes the meaning of the base verb. Learn common phrasal verbs as complete expressions.",
      mistake: "Knowing the base verb but ignoring the particle meaning.",
      recap: "Verb plus particle equals new meaning."
    },
    study_habits: {
      label: "Study Habits",
      goal: "use short daily revision loops and active recall",
      teach: "Small daily practice beats last-minute cramming. Review mistakes quickly, then revisit them after a few days.",
      mistake: "Only reading notes without checking understanding.",
      recap: "Short, regular, active review wins."
    },
    exam_strategy: {
      label: "Exam Strategy",
      goal: "use a clear check routine under time pressure",
      teach: "Read the sentence frame, pick an answer, then run a 5-second grammar and meaning check.",
      mistake: "Rushing the answer and skipping final checks.",
      recap: "Answer, then check."
    },
    composition: {
      label: "Composition",
      goal: "write clear paragraphs with strong connectors and sentence flow",
      teach: "Plan ideas first, write one clear idea per paragraph, then revise verbs and connectors.",
      mistake: "Writing many ideas without clear linking words.",
      recap: "Plan, write, link, revise."
    }
  };

  var CHAPTERS = [
    {
      id: "ch1",
      title: "How to Use This Book and Baseline Study Skills",
      shortTitle: "Study Start",
      startPage: 1,
      endPage: 40,
      focusTags: ["study_habits", "function_words", "connector_contrast_condition"]
    },
    {
      id: "ch2",
      title: "Word-Class Signals at the Blank",
      shortTitle: "Word-Class Clues",
      startPage: 41,
      endPage: 180,
      focusTags: ["function_words", "function_words", "connector_contrast_condition"]
    },
    {
      id: "ch3",
      title: "Function Words Mastery",
      shortTitle: "Function Word Boost",
      startPage: 181,
      endPage: 320,
      focusTags: ["function_words", "collocation_prep", "sva"]
    },
    {
      id: "ch4",
      title: "Collocations and Fixed Phrases",
      shortTitle: "Collocation Coach",
      startPage: 321,
      endPage: 430,
      focusTags: ["collocation_prep", "phrasal_verbs", "function_words"]
    },
    {
      id: "ch5",
      title: "Subject-Verb Agreement Under Distraction",
      shortTitle: "Agreement Anchor",
      startPage: 431,
      endPage: 530,
      focusTags: ["sva", "function_words", "connector_contrast_condition"]
    },
    {
      id: "ch6",
      title: "Tense Sequencing and Past Perfect",
      shortTitle: "Timeline Tenses",
      startPage: 531,
      endPage: 650,
      focusTags: ["past_perfect", "function_words", "connector_contrast_condition"]
    },
    {
      id: "ch7",
      title: "Modals in PSLE Usage",
      shortTitle: "Modal Moves",
      startPage: 651,
      endPage: 730,
      focusTags: ["modal_should", "function_words", "connector_contrast_condition"]
    },
    {
      id: "ch8",
      title: "Connectors by Logic and Grammar Form",
      shortTitle: "Connector Control",
      startPage: 731,
      endPage: 830,
      focusTags: ["connector_contrast_condition", "modal_should", "function_words"]
    },
    {
      id: "ch9",
      title: "Phrasal Verbs and Idioms",
      shortTitle: "Phrasal Power",
      startPage: 831,
      endPage: 920,
      focusTags: ["phrasal_verbs", "collocation_prep", "function_words"]
    },
    {
      id: "ch10",
      title: "PSLE Paper 2 Integrated Practice",
      shortTitle: "Paper 2 Lab",
      startPage: 921,
      endPage: 970,
      focusTags: ["exam_strategy", "function_words", "past_perfect", "connector_contrast_condition"]
    },
    {
      id: "ch11",
      title: "Paper 1 Composition Toolkit and Final Revision",
      shortTitle: "Paper 1 Finish",
      startPage: 971,
      endPage: 1000,
      focusTags: ["composition", "function_words", "connector_contrast_condition", "phrasal_verbs"]
    }
  ];

  var ITEM_BANK = {
    study_habits: [
      {
        type: "mcq",
        prompt: "Which plan is best for PSLE revision?",
        options: ["30 minutes daily review", "4 hours only on Sunday", "No revision plan", "Only read answers"],
        answer: "30 minutes daily review",
        explanation: "Short daily practice helps memory stay strong.",
        hint: "Pick the most regular and realistic routine."
      },
      {
        type: "mcq",
        prompt: "After getting a question wrong, what should you do first?",
        options: ["Write the fix rule", "Ignore it", "Memorise only the answer", "Skip to new topic"],
        answer: "Write the fix rule",
        explanation: "A short fix rule helps you avoid repeating the same mistake.",
        hint: "Think of active review."
      },
      {
        type: "mcq",
        prompt: "Best order for checking a cloze answer:",
        options: ["Signal, choose, re-read", "Choose fast, submit", "Read options only", "Skip and guess"],
        answer: "Signal, choose, re-read",
        explanation: "This sequence checks both grammar and meaning.",
        hint: "Use the strategy loop taught in this book."
      },
      {
        type: "mcq",
        prompt: "When should you revisit your notebook mistakes?",
        options: ["Today, then again later", "Only before the exam", "Never revisit", "Only when teacher reminds"],
        answer: "Today, then again later",
        explanation: "Spaced review helps mistakes become strengths.",
        hint: "Think of the revisit buckets."
      },
      {
        type: "mcq",
        prompt: "What is active recall?",
        options: ["Testing yourself without looking", "Reading notes many times", "Copying answers", "Listening only"],
        answer: "Testing yourself without looking",
        explanation: "Trying to remember from memory builds stronger recall.",
        hint: "You should retrieve, not just reread."
      },
      {
        type: "mcq",
        prompt: "Before moving to the next page, you should:",
        options: ["Complete both Try It questions", "Skip practice", "Read title only", "Do one random question"],
        answer: "Complete both Try It questions",
        explanation: "Practice confirms understanding, not just reading.",
        hint: "Use completion signals."
      }
    ],
    exam_strategy: [
      {
        type: "mcq",
        prompt: "In Paper 2 cloze, first you should:",
        options: ["Read the full sentence frame", "Pick longest option", "Choose rare word", "Skip grammar clues"],
        answer: "Read the full sentence frame",
        explanation: "Sentence frame tells you the needed grammar function.",
        hint: "Meaning and grammar clues come from context."
      },
      {
        type: "mcq",
        prompt: "If two options look similar, best next step:",
        options: ["Check word class and collocation", "Guess quickly", "Pick first option", "Avoid checking"],
        answer: "Check word class and collocation",
        explanation: "Grammar form and fixed phrases decide close options.",
        hint: "Use a specific check, not guessing."
      },
      {
        type: "mcq",
        prompt: "How long should your final answer check be?",
        options: ["About 5 seconds per blank", "No checking needed", "30 seconds each blank", "Only check spelling"],
        answer: "About 5 seconds per blank",
        explanation: "A quick, focused check catches many avoidable mistakes.",
        hint: "Use a short routine during timed papers."
      },
      {
        type: "mcq",
        prompt: "When a sentence has two past actions, you should check for:",
        options: ["Past perfect for earlier action", "Present perfect only", "Future tense", "No tense clues"],
        answer: "Past perfect for earlier action",
        explanation: "Past perfect shows the earlier event clearly in a timeline.",
        hint: "Find action 1 and action 2."
      },
      {
        type: "mcq",
        prompt: "Best way to avoid connector mistakes:",
        options: ["Identify logic link first", "Pick connector by length", "Always use unless", "Always use although"],
        answer: "Identify logic link first",
        explanation: "You must know if the sentence needs contrast, reason, time, or condition.",
        hint: "Meaning comes before option choice."
      },
      {
        type: "mcq",
        prompt: "If unsure between two answers, you should:",
        options: ["Re-read whole sentence aloud quietly", "Close eyes and choose", "Pick the harder word", "Leave blank"],
        answer: "Re-read whole sentence aloud quietly",
        explanation: "Full-sentence checking often reveals awkward grammar.",
        hint: "Natural sentence flow is a useful signal."
      }
    ],
    composition: [
      {
        type: "mcq",
        prompt: "Best topic sentence for a paragraph about teamwork:",
        options: [
          "Teamwork helped us solve the problem quickly.",
          "It was there and then and maybe later.",
          "People and things were doing something.",
          "This paragraph has many random ideas."
        ],
        answer: "Teamwork helped us solve the problem quickly.",
        explanation: "A topic sentence states one clear main idea.",
        hint: "Choose the clearest central point."
      },
      {
        type: "cloze_input",
        prompt: "Fill a suitable connector: ___ we were nervous, we encouraged one another.",
        answer: "Although",
        explanation: "The ideas contrast, so 'Although' fits.",
        hint: "Contrast connector needed."
      },
      {
        type: "mcq",
        prompt: "Choose the better closing sentence:",
        options: [
          "From that day, I learned that teamwork turns fear into courage.",
          "Then and then and then.",
          "I don't know what happened next.",
          "The end because words finished."
        ],
        answer: "From that day, I learned that teamwork turns fear into courage.",
        explanation: "A strong ending gives reflection and meaning.",
        hint: "Pick the sentence with lesson learned."
      },
      {
        type: "cloze_input",
        prompt: "Add one vivid verb: The boy ___ across the field to help his friend.",
        answer: "raced",
        explanation: "A vivid verb makes action clearer than plain words.",
        hint: "Choose a stronger action verb than 'went'."
      },
      {
        type: "mcq",
        prompt: "Which sentence keeps tense consistent?",
        options: [
          "I opened the bag and found the missing wallet.",
          "I opened the bag and find the missing wallet.",
          "I open the bag and found the missing wallet.",
          "I will open the bag and found the missing wallet."
        ],
        answer: "I opened the bag and found the missing wallet.",
        explanation: "Both actions are in simple past, so tense is consistent.",
        hint: "Check that verbs stay in the same timeline."
      },
      {
        type: "mcq",
        prompt: "Best paragraph order:",
        options: [
          "Beginning, problem, actions, ending reflection",
          "Ending first, no problem, random middle",
          "Problem only, then stop",
          "One long sentence for everything"
        ],
        answer: "Beginning, problem, actions, ending reflection",
        explanation: "Clear structure helps readers follow your story.",
        hint: "Think of a logical story flow."
      }
    ],
    function_words: [
      {
        type: "cloze_select",
        prompt: "___ eagle can spot a fish from far away.",
        options: ["A", "An", "The", "Some"],
        answer: "An",
        explanation: "Use 'an' before a vowel sound.",
        hint: "Read the first sound in 'eagle'."
      },
      {
        type: "cloze_select",
        prompt: "The kittens ___ sleeping near the window.",
        options: ["is", "are", "was", "be"],
        answer: "are",
        explanation: "Plural subject 'kittens' needs plural verb 'are'.",
        hint: "Check if the subject is one or many."
      },
      {
        type: "cloze_select",
        prompt: "Please put the books ___ the shelf.",
        options: ["on", "at", "in", "for"],
        answer: "on",
        explanation: "Books rest on a shelf, so 'on' is correct.",
        hint: "Think of surface position."
      },
      {
        type: "cloze_input",
        prompt: "My brother and I ___ going to the library now.",
        answer: "are",
        explanation: "'My brother and I' is plural, so use 'are'.",
        hint: "Two people need a plural helping verb."
      },
      {
        type: "mcq",
        prompt: "Choose the best word: The team ___ practised hard for the match.",
        options: ["has", "have", "are", "were"],
        answer: "has",
        explanation: "'Team' is treated as one group here, so 'has' fits.",
        hint: "Is team one unit or many separate people in this sentence?"
      },
      {
        type: "cloze_select",
        prompt: "The teacher smiled ___ she saw neat handwriting.",
        options: ["when", "unless", "despite", "during"],
        answer: "when",
        explanation: "The smile happened at that time, so use 'when'.",
        hint: "Look for a time relationship."
      },
      {
        type: "cloze_select",
        prompt: "We can start the game ___ everyone is ready.",
        options: ["because", "although", "unless", "while"],
        answer: "because",
        explanation: "The reason for starting is that everyone is ready.",
        hint: "Find the reason word."
      },
      {
        type: "cloze_input",
        prompt: "Rina ___ finished her worksheet before recess.",
        answer: "had",
        explanation: "Use 'had' with past participle to show the earlier past action.",
        hint: "This sentence points to an earlier completed action."
      },
      {
        type: "cloze_select",
        prompt: "I have a map, ___ I still got lost in the park.",
        options: ["but", "because", "if", "so"],
        answer: "but",
        explanation: "'But' shows contrast between expectation and result.",
        hint: "Do the two clauses agree or contrast?"
      },
      {
        type: "cloze_input",
        prompt: "Please write ___ date at the top of the page.",
        answer: "the",
        explanation: "A specific date in this context needs 'the'.",
        hint: "The class knows exactly which date to write."
      },
      {
        type: "mcq",
        prompt: "Choose the best article: ___ hour passed before help came.",
        options: ["A", "An", "The", "No article"],
        answer: "An",
        explanation: "'Hour' begins with a vowel sound, so use 'an'.",
        hint: "Listen to the sound, not the first letter only."
      },
      {
        type: "cloze_select",
        prompt: "The puppy ran ___ the gate and into the garden.",
        options: ["through", "during", "above", "except"],
        answer: "through",
        explanation: "The puppy moved from one side to another through an opening.",
        hint: "Think movement across an opening."
      }
    ],
    collocation_prep: [
      {
        type: "cloze_select",
        prompt: "The old wooden fence broke ___ pieces in the storm.",
        options: ["to", "for", "at", "under"],
        answer: "to",
        explanation: "The fixed phrase is 'break to pieces'.",
        hint: "Remember the exact chunk."
      },
      {
        type: "cloze_select",
        prompt: "The hikers felt helpless ___ the face of thick fog.",
        options: ["in", "at", "on", "from"],
        answer: "in",
        explanation: "The fixed expression is 'in the face of'.",
        hint: "This phrase must stay unchanged."
      },
      {
        type: "cloze_select",
        prompt: "Mina is good ___ solving tricky riddles.",
        options: ["at", "for", "to", "with"],
        answer: "at",
        explanation: "The collocation is 'good at'.",
        hint: "Good ___ something."
      },
      {
        type: "cloze_select",
        prompt: "The class is excited ___ the science trip.",
        options: ["about", "in", "by", "onto"],
        answer: "about",
        explanation: "We say 'excited about' an event.",
        hint: "Which preposition pairs with feelings here?"
      },
      {
        type: "cloze_select",
        prompt: "We must depend ___ one another during the challenge.",
        options: ["on", "at", "in", "over"],
        answer: "on",
        explanation: "The correct collocation is 'depend on'.",
        hint: "Depend always takes one preposition."
      },
      {
        type: "cloze_select",
        prompt: "Nora was proud ___ her neat model.",
        options: ["of", "on", "for", "with"],
        answer: "of",
        explanation: "The phrase is 'proud of'.",
        hint: "Proud ___ something."
      },
      {
        type: "cloze_input",
        prompt: "The tourists were amazed ___ the giant waterfall.",
        answer: "by",
        explanation: "We say 'amazed by' when something causes surprise.",
        hint: "Who or what caused the amazement?"
      },
      {
        type: "cloze_select",
        prompt: "Please divide the class ___ groups of four.",
        options: ["into", "at", "with", "for"],
        answer: "into",
        explanation: "The collocation is 'divide into groups'.",
        hint: "Split something to form parts."
      },
      {
        type: "cloze_select",
        prompt: "They paid attention ___ the safety rules.",
        options: ["to", "in", "on", "at"],
        answer: "to",
        explanation: "The fixed phrase is 'pay attention to'.",
        hint: "Attention always goes with one preposition."
      },
      {
        type: "cloze_select",
        prompt: "The children laughed ___ the clown's funny hat.",
        options: ["at", "to", "of", "for"],
        answer: "at",
        explanation: "The collocation is 'laugh at'.",
        hint: "People laugh ___ someone or something."
      },
      {
        type: "cloze_input",
        prompt: "She succeeded ___ finishing the puzzle first.",
        answer: "in",
        explanation: "The expression is 'succeed in doing'.",
        hint: "Succeed ___ + gerund."
      },
      {
        type: "cloze_select",
        prompt: "He apologised ___ being late for class.",
        options: ["for", "of", "at", "with"],
        answer: "for",
        explanation: "The collocation is 'apologise for'.",
        hint: "What comes after 'apologised'?"
      }
    ],
    sva: [
      {
        type: "mcq",
        prompt: "Western honeybees ___ a useful trick for finding flowers.",
        options: ["has", "have", "is having", "was"],
        answer: "have",
        explanation: "'Honeybees' is plural, so use 'have'.",
        hint: "Find the real subject first."
      },
      {
        type: "mcq",
        prompt: "A basket of oranges ___ on the table.",
        options: ["are", "is", "were", "have"],
        answer: "is",
        explanation: "The subject is 'basket' (singular), not 'oranges'.",
        hint: "Ignore the 'of' phrase."
      },
      {
        type: "mcq",
        prompt: "The players in the blue jerseys ___ ready.",
        options: ["is", "are", "was", "has"],
        answer: "are",
        explanation: "The subject 'players' is plural.",
        hint: "Which noun controls the verb?"
      },
      {
        type: "mcq",
        prompt: "Each of the books ___ a name label.",
        options: ["have", "has", "are", "were"],
        answer: "has",
        explanation: "'Each' is singular, so use 'has'.",
        hint: "Treat 'each' as one."
      },
      {
        type: "mcq",
        prompt: "My brother and cousin ___ in the school band.",
        options: ["is", "are", "was", "has"],
        answer: "are",
        explanation: "Two people joined by 'and' make a plural subject.",
        hint: "Count the people in the subject."
      },
      {
        type: "mcq",
        prompt: "Neither the teacher nor the students ___ noisy.",
        options: ["was", "is", "are", "has"],
        answer: "are",
        explanation: "Verb agrees with the nearer subject 'students' (plural).",
        hint: "In 'neither...nor', check the noun nearest the verb."
      },
      {
        type: "mcq",
        prompt: "The team of runners ___ very determined.",
        options: ["is", "are", "were", "have"],
        answer: "is",
        explanation: "'Team' is one unit in this sentence.",
        hint: "Is team acting as one group?"
      },
      {
        type: "mcq",
        prompt: "Many of the cakes ___ already sold.",
        options: ["has", "is", "are", "was"],
        answer: "are",
        explanation: "'Many' indicates plural, so use 'are'.",
        hint: "Signal word 'many' helps."
      },
      {
        type: "mcq",
        prompt: "The list of spelling words ___ on the notice board.",
        options: ["are", "is", "were", "have"],
        answer: "is",
        explanation: "Main subject is 'list' (singular).",
        hint: "Ignore words after 'of'."
      },
      {
        type: "mcq",
        prompt: "Either my aunt or my uncles ___ coming tonight.",
        options: ["is", "are", "was", "has"],
        answer: "are",
        explanation: "Verb agrees with the closer subject 'uncles' (plural).",
        hint: "Check the noun nearest the verb."
      },
      {
        type: "mcq",
        prompt: "The news about the competition ___ exciting.",
        options: ["are", "is", "were", "have"],
        answer: "is",
        explanation: "'News' is singular in formal grammar.",
        hint: "Some nouns look plural but take singular verbs."
      },
      {
        type: "mcq",
        prompt: "Both the rabbit and the turtle ___ in the race story.",
        options: ["is", "are", "was", "has"],
        answer: "are",
        explanation: "'Both ... and ...' gives a plural subject.",
        hint: "Two nouns joined by 'and' need plural verb."
      }
    ],
    past_perfect: [
      {
        type: "tense_timeline",
        prompt: "When Mr Lim reached the terminal, he realised he ___ the tickets at home.",
        answer: "had left",
        explanation: "Leaving the tickets happened earlier than realising at the terminal.",
        hint: "Earlier past action needs 'had + verb'."
      },
      {
        type: "tense_timeline",
        prompt: "By the time the bell rang, we ___ our experiment.",
        answer: "had completed",
        explanation: "Experiment finished before the bell rang.",
        hint: "Which action happened first?"
      },
      {
        type: "tense_timeline",
        prompt: "They were tired because they ___ for two hours.",
        answer: "had walked",
        explanation: "Walking happened before feeling tired.",
        hint: "Cause happened earlier than result."
      },
      {
        type: "tense_timeline",
        prompt: "The movie ___ before we arrived at the hall.",
        answer: "had started",
        explanation: "Starting happened before arriving.",
        hint: "Use past perfect for the earlier event."
      },
      {
        type: "tense_timeline",
        prompt: "She could answer quickly because she ___ the chapter.",
        answer: "had revised",
        explanation: "Revision happened before answering quickly.",
        hint: "Think of preparation happening first."
      },
      {
        type: "tense_timeline",
        prompt: "When the teacher collected the worksheets, I ___ mine.",
        answer: "had finished",
        explanation: "Finishing happened before collection.",
        hint: "Earlier completed action takes past perfect."
      },
      {
        type: "tense_timeline",
        prompt: "After we ___ lunch, we returned to class.",
        answer: "had eaten",
        explanation: "Eating came before returning.",
        hint: "Action one happens before action two."
      },
      {
        type: "tense_timeline",
        prompt: "The coach praised us because we ___ hard.",
        answer: "had trained",
        explanation: "Training happened earlier than praise.",
        hint: "Past reason before past response."
      },
      {
        type: "tense_timeline",
        prompt: "Before the rain started, the workers ___ the roof.",
        answer: "had fixed",
        explanation: "Fixing came first in the timeline.",
        hint: "What finished before rain started?"
      },
      {
        type: "tense_timeline",
        prompt: "She felt relieved after she ___ her apology.",
        answer: "had made",
        explanation: "Making the apology happened before feeling relieved.",
        hint: "Earlier action first."
      },
      {
        type: "tense_timeline",
        prompt: "By 8 p.m., the family ___ the puzzle together.",
        answer: "had solved",
        explanation: "The puzzle was already solved before that time point.",
        hint: "'By' often signals completed action before a past time."
      },
      {
        type: "tense_timeline",
        prompt: "The boy could not open the file because he ___ the password.",
        answer: "had forgotten",
        explanation: "Forgetting happened before trying to open the file.",
        hint: "Use past perfect for the earlier cause."
      }
    ],
    modal_should: [
      {
        type: "mcq",
        prompt: "The visitors were told what to do ___ a fire break out.",
        options: ["shall", "should", "would", "must"],
        answer: "should",
        explanation: "'Should a fire break out' means 'if a fire breaks out'.",
        hint: "Look for a conditional warning pattern."
      },
      {
        type: "mcq",
        prompt: "You ___ bring a water bottle for outdoor practice.",
        options: ["should", "shall", "could", "might"],
        answer: "should",
        explanation: "This sentence gives advice, so 'should' fits best.",
        hint: "Is it advice or a formal promise?"
      },
      {
        type: "mcq",
        prompt: "___ you need help, raise your hand.",
        options: ["Shall", "Should", "Would", "Must"],
        answer: "Should",
        explanation: "'Should you need help' is a formal conditional structure.",
        hint: "This means 'if you need help'."
      },
      {
        type: "mcq",
        prompt: "Students ___ check their answers before handing in the paper.",
        options: ["should", "shall", "might", "can"],
        answer: "should",
        explanation: "Checking answers is recommended action.",
        hint: "Choose the modal for advice."
      },
      {
        type: "mcq",
        prompt: "If the alarm rings, we ___ leave the hall calmly.",
        options: ["shall", "should", "would", "could"],
        answer: "should",
        explanation: "In emergency instructions, 'should' can indicate expected action.",
        hint: "What modal sounds right for expected response?"
      },
      {
        type: "mcq",
        prompt: "I ___ like to thank everyone for their help.",
        options: ["shall", "should", "must", "might"],
        answer: "should",
        explanation: "In polite formal expression, 'should like' is acceptable.",
        hint: "Look at the polite phrase pattern."
      },
      {
        type: "mcq",
        prompt: "Parents ___ set a regular bedtime for children.",
        options: ["should", "shall", "would", "may"],
        answer: "should",
        explanation: "This gives sensible advice.",
        hint: "Advice usually takes one modal."
      },
      {
        type: "mcq",
        prompt: "___ there be any delay, please stay seated.",
        options: ["Should", "Shall", "Would", "Could"],
        answer: "Should",
        explanation: "'Should there be' is a conditional form meaning 'if there is'.",
        hint: "This is another inverted conditional sentence."
      },
      {
        type: "mcq",
        prompt: "To stay healthy, we ___ sleep early.",
        options: ["should", "shall", "might", "would"],
        answer: "should",
        explanation: "The sentence gives health advice.",
        hint: "Choose the advice modal."
      },
      {
        type: "mcq",
        prompt: "___ a storm approach, the event will move indoors.",
        options: ["Shall", "Should", "Would", "Must"],
        answer: "Should",
        explanation: "This means 'if a storm approaches'.",
        hint: "Find the modal that introduces condition."
      },
      {
        type: "mcq",
        prompt: "Candidates ___ read every option before choosing.",
        options: ["should", "shall", "might", "could"],
        answer: "should",
        explanation: "This is strong exam advice.",
        hint: "Advice and exam tips use one common modal."
      },
      {
        type: "mcq",
        prompt: "___ you feel unwell, tell the teacher immediately.",
        options: ["Shall", "Should", "May", "Might"],
        answer: "Should",
        explanation: "The sentence means 'if you feel unwell'.",
        hint: "It is a condition, not a promise."
      }
    ],
    connector_contrast_condition: [
      {
        type: "connector_choice",
        prompt: "___ the bus was very crowded, commuters were still allowed to board.",
        options: ["Although", "Unless", "Because", "If"],
        answer: "Although",
        explanation: "The sentence shows contrast, so 'Although' fits.",
        hint: "Does the second clause go against expectation?"
      },
      {
        type: "connector_choice",
        prompt: "___ you revise a little each day, you will improve steadily.",
        options: ["If", "Although", "Unless", "While"],
        answer: "If",
        explanation: "The sentence gives a condition and result.",
        hint: "Condition-result pair."
      },
      {
        type: "connector_choice",
        prompt: "___ it was raining, the match continued.",
        options: ["Although", "Unless", "Because", "Since"],
        answer: "Although",
        explanation: "Rain and continued match show contrast.",
        hint: "Choose the contrast linker."
      },
      {
        type: "connector_choice",
        prompt: "You cannot enter ___ you wear the lab coat.",
        options: ["unless", "although", "because", "while"],
        answer: "unless",
        explanation: "'Unless' means 'except if'.",
        hint: "This is a condition for entry."
      },
      {
        type: "connector_choice",
        prompt: "___ the class was noisy, the teacher remained calm.",
        options: ["Although", "If", "Unless", "Because"],
        answer: "Although",
        explanation: "This is concession/contrast.",
        hint: "Calmness contrasts with noise."
      },
      {
        type: "connector_choice",
        prompt: "Bring an umbrella ___ it starts to rain later.",
        options: ["in case", "although", "unless", "while"],
        answer: "in case",
        explanation: "'In case' prepares for a possible event.",
        hint: "This is prevention planning."
      },
      {
        type: "connector_choice",
        prompt: "___ she was tired, she completed her homework neatly.",
        options: ["Although", "Unless", "Because", "If"],
        answer: "Although",
        explanation: "Tiredness contrasts with completing work well.",
        hint: "Look for opposite expectation."
      },
      {
        type: "connector_choice",
        prompt: "___ you leave now, you can catch the earlier train.",
        options: ["If", "Although", "Unless", "During"],
        answer: "If",
        explanation: "The sentence describes a condition.",
        hint: "Condition comes first here."
      },
      {
        type: "connector_choice",
        prompt: "The hall was warm ___ all the windows were closed.",
        options: ["because", "although", "unless", "if"],
        answer: "because",
        explanation: "Closed windows explain why the hall was warm.",
        hint: "Find the reason connector."
      },
      {
        type: "connector_choice",
        prompt: "___ he apologises, they will not continue the game.",
        options: ["Unless", "Although", "Because", "When"],
        answer: "Unless",
        explanation: "The game stops except if he apologises.",
        hint: "Think 'except if'."
      },
      {
        type: "connector_choice",
        prompt: "___ the clues were hard, the team solved the mystery.",
        options: ["Although", "If", "Since", "Until"],
        answer: "Although",
        explanation: "Hard clues contrast with solving success.",
        hint: "Pick the concession marker."
      },
      {
        type: "connector_choice",
        prompt: "I will call you ___ I reach home.",
        options: ["when", "although", "unless", "because"],
        answer: "when",
        explanation: "The sentence links to a time event.",
        hint: "Choose the time connector."
      }
    ],
    phrasal_verbs: [
      {
        type: "phrasal_choice",
        prompt: "Their plan to build a treehouse ___ because of poor teamwork.",
        options: ["fell through", "fell out", "fell in", "fell on"],
        answer: "fell through",
        explanation: "'Fell through' means failed to happen.",
        hint: "Which phrase means 'did not happen'?"
      },
      {
        type: "phrasal_choice",
        prompt: "Please ___ your shoes before entering the hall.",
        options: ["take off", "take up", "take in", "take over"],
        answer: "take off",
        explanation: "'Take off' means remove.",
        hint: "You remove shoes, not start a project."
      },
      {
        type: "phrasal_choice",
        prompt: "Do not ___ stories. Tell the truth.",
        options: ["make up", "make out", "make over", "make off"],
        answer: "make up",
        explanation: "'Make up stories' means invent stories.",
        hint: "Which phrase means invent?"
      },
      {
        type: "phrasal_choice",
        prompt: "The coach told us not to ___ before the final whistle.",
        options: ["give up", "give in", "give out", "give away"],
        answer: "give up",
        explanation: "'Give up' means stop trying.",
        hint: "You should keep trying in a match."
      },
      {
        type: "phrasal_choice",
        prompt: "Can you ___ this word in the dictionary?",
        options: ["look up", "look for", "look after", "look down"],
        answer: "look up",
        explanation: "'Look up' means search for information.",
        hint: "Dictionary action phrase."
      },
      {
        type: "phrasal_choice",
        prompt: "Please ___ the form before Tuesday.",
        options: ["hand in", "hand over", "hand down", "hand out"],
        answer: "hand in",
        explanation: "'Hand in' means submit.",
        hint: "School forms are usually submitted."
      },
      {
        type: "phrasal_choice",
        prompt: "The lights suddenly ___ during the storm.",
        options: ["went out", "went over", "went through", "went by"],
        answer: "went out",
        explanation: "'Went out' means stopped shining.",
        hint: "Think of lights turning off."
      },
      {
        type: "phrasal_choice",
        prompt: "We need to ___ a better plan for revision.",
        options: ["come up with", "come across", "come over", "come through"],
        answer: "come up with",
        explanation: "'Come up with' means think of an idea.",
        hint: "You generate a plan."
      },
      {
        type: "phrasal_choice",
        prompt: "Please ___ while I check your answer.",
        options: ["hold on", "hold up", "hold out", "hold down"],
        answer: "hold on",
        explanation: "'Hold on' means wait for a short time.",
        hint: "You are asked to wait."
      },
      {
        type: "phrasal_choice",
        prompt: "The class monitor will ___ the worksheets now.",
        options: ["hand out", "hand in", "hand over", "hand up"],
        answer: "hand out",
        explanation: "'Hand out' means distribute.",
        hint: "Who gives papers to everyone?"
      },
      {
        type: "phrasal_choice",
        prompt: "I cannot ___ this tiny handwriting.",
        options: ["make out", "make up", "make for", "make over"],
        answer: "make out",
        explanation: "'Make out' means read or understand with difficulty.",
        hint: "You are trying to read unclear text."
      },
      {
        type: "phrasal_choice",
        prompt: "Do not ___ your little sister when she asks a question.",
        options: ["brush off", "brush up", "brush out", "brush by"],
        answer: "brush off",
        explanation: "'Brush off' means dismiss or ignore rudely.",
        hint: "Which phrase means ignore?"
      }
    ]
  };

  var LESSON_TITLES = [
    "Signal Detective",
    "Grammar Clue Hunt",
    "Sentence Builder",
    "Exam Smart Move",
    "Meaning and Form",
    "Chunk Practice",
    "Fix and Check",
    "Confidence Drill"
  ];

  var BOOSTER_NAMES = [
    "Mix and Fix",
    "Rapid Repair",
    "Weak Spot Workout",
    "Smart Revision Sprint"
  ];

  var WORKED_EXAMPLE_BANK = {
    function_words: [
      {
        prompt: "Example: ___ eagle can spot tiny movement from far away.",
        steps: [
          "Look at the noun after the blank: eagle.",
          "Listen to the first sound. It is a vowel sound.",
          "Use the article 'An' for vowel sound words."
        ],
        answer: "An"
      },
      {
        prompt: "Example: The puppies ___ chasing one another in the yard.",
        steps: [
          "Find the subject: puppies.",
          "Puppies is plural.",
          "Use the helping verb 'are'."
        ],
        answer: "are"
      },
      {
        prompt: "Example: Please place the painting ___ the wall.",
        steps: [
          "Think of location: attached to a surface.",
          "For surfaces, we often use 'on'.",
          "Read again: the phrase sounds natural."
        ],
        answer: "on"
      },
      {
        prompt: "Example: We stayed indoors ___ it was raining heavily.",
        steps: [
          "Find the logic link between clauses.",
          "One clause gives the reason for the other.",
          "Use the connector 'because'."
        ],
        answer: "because"
      },
      {
        prompt: "Example: The children ___ excited about the school trip.",
        steps: [
          "Subject is children (plural).",
          "Sentence is in present time.",
          "Choose 'are' to match subject and tense."
        ],
        answer: "are"
      },
      {
        prompt: "Example: Please write ___ date on your worksheet.",
        steps: [
          "Class is writing one specific date.",
          "Specific noun phrase usually takes 'the'.",
          "Insert 'the' and re-read the sentence."
        ],
        answer: "the"
      }
    ],
    collocation_prep: [
      {
        prompt: "Example: The old toy broke ___ pieces.",
        steps: [
          "This is a fixed collocation.",
          "The phrase is 'break to pieces'.",
          "Use the exact preposition from the chunk."
        ],
        answer: "to"
      },
      {
        prompt: "Example: The hikers were helpless ___ the face of thick fog.",
        steps: [
          "Spot the idiomatic phrase pattern.",
          "The full expression is 'in the face of'.",
          "Insert 'in'."
        ],
        answer: "in"
      },
      {
        prompt: "Example: Nora is good ___ solving puzzles.",
        steps: [
          "This is a common adjective-preposition pair.",
          "The correct collocation is 'good at'.",
          "Use 'at'."
        ],
        answer: "at"
      },
      {
        prompt: "Example: We must depend ___ one another during camp.",
        steps: [
          "Think of the fixed phrase with 'depend'.",
          "It pairs with 'on'.",
          "Check: 'depend on one another' sounds correct."
        ],
        answer: "on"
      },
      {
        prompt: "Example: Please divide the class ___ groups of four.",
        steps: [
          "Sentence means split into parts.",
          "The collocation is 'divide into groups'.",
          "Use 'into'."
        ],
        answer: "into"
      },
      {
        prompt: "Example: They paid attention ___ the safety instructions.",
        steps: [
          "Identify the verb phrase 'pay attention'.",
          "It is followed by 'to'.",
          "Insert 'to' and re-read."
        ],
        answer: "to"
      }
    ],
    sva: [
      {
        prompt: "Example: Western honeybees ___ a special dance pattern.",
        steps: [
          "Find the real subject: honeybees.",
          "Honeybees is plural.",
          "Use plural verb 'have'."
        ],
        answer: "have"
      },
      {
        prompt: "Example: A basket of oranges ___ on the table.",
        steps: [
          "Ignore words after 'of'.",
          "Main subject is basket (singular).",
          "Use 'is'."
        ],
        answer: "is"
      },
      {
        prompt: "Example: Neither the teacher nor the students ___ late.",
        steps: [
          "In 'neither...nor', check the subject nearest the verb.",
          "Nearest noun is students (plural).",
          "Use 'are'."
        ],
        answer: "are"
      },
      {
        prompt: "Example: The list of names ___ on the board.",
        steps: [
          "Main subject is list.",
          "List is singular.",
          "Choose 'is'."
        ],
        answer: "is"
      },
      {
        prompt: "Example: Both the rabbit and the turtle ___ in the story.",
        steps: [
          "Two subjects are joined by 'and'.",
          "That makes the subject plural.",
          "Use 'are'."
        ],
        answer: "are"
      },
      {
        prompt: "Example: Each of the pupils ___ a reading file.",
        steps: [
          "The keyword is 'each'.",
          "'Each' takes a singular verb.",
          "Use 'has'."
        ],
        answer: "has"
      }
    ],
    past_perfect: [
      {
        prompt: "Example: When Mr Lim arrived, he realised he ___ the tickets at home.",
        steps: [
          "There are two past actions.",
          "Leaving tickets happened earlier than arriving.",
          "Earlier past action uses 'had left'."
        ],
        answer: "had left"
      },
      {
        prompt: "Example: By the time the bell rang, we ___ our experiment.",
        steps: [
          "Bell rang is one past moment.",
          "Experiment finished before that moment.",
          "Use past perfect: 'had completed'."
        ],
        answer: "had completed"
      },
      {
        prompt: "Example: The movie ___ before we reached the hall.",
        steps: [
          "Reached hall happened later.",
          "Movie start happened earlier.",
          "Use 'had started'."
        ],
        answer: "had started"
      },
      {
        prompt: "Example: She was relieved because she ___ her apology.",
        steps: [
          "Being relieved happened after one action.",
          "Apology happened first.",
          "Write 'had made'."
        ],
        answer: "had made"
      },
      {
        prompt: "Example: Before the rain began, the workers ___ the roof.",
        steps: [
          "Rain began at a later past point.",
          "Fixing the roof was earlier.",
          "Use 'had fixed'."
        ],
        answer: "had fixed"
      },
      {
        prompt: "Example: They were tired because they ___ for two hours.",
        steps: [
          "Tiredness is the later result.",
          "Walking is the earlier cause.",
          "Use 'had walked'."
        ],
        answer: "had walked"
      }
    ],
    modal_should: [
      {
        prompt: "Example: ___ a fire break out, leave the hall calmly.",
        steps: [
          "This means 'if a fire breaks out'.",
          "The conditional inversion uses 'should'.",
          "Insert 'Should'."
        ],
        answer: "Should"
      },
      {
        prompt: "Example: You ___ bring a water bottle for outdoor drills.",
        steps: [
          "The sentence gives advice.",
          "Advice takes modal 'should'.",
          "Use 'should'."
        ],
        answer: "should"
      },
      {
        prompt: "Example: ___ there be any delay, stay seated.",
        steps: [
          "This is an inverted conditional sentence.",
          "It means 'if there is any delay'.",
          "Use 'Should'."
        ],
        answer: "Should"
      },
      {
        prompt: "Example: Students ___ check all options before choosing.",
        steps: [
          "Sentence gives a recommendation.",
          "Recommendation needs 'should'.",
          "Insert 'should'."
        ],
        answer: "should"
      },
      {
        prompt: "Example: ___ you need help, raise your hand.",
        steps: [
          "This means 'if you need help'.",
          "The formal conditional form is 'Should you...'.",
          "Choose 'Should'."
        ],
        answer: "Should"
      },
      {
        prompt: "Example: To stay healthy, we ___ sleep early.",
        steps: [
          "The sentence gives advice for health.",
          "Best modal for advice is 'should'.",
          "Use 'should'."
        ],
        answer: "should"
      }
    ],
    connector_contrast_condition: [
      {
        prompt: "Example: ___ the bus was crowded, commuters still boarded it.",
        steps: [
          "The two clauses show contrast.",
          "Crowded but still boarded = concession.",
          "Use 'Although'."
        ],
        answer: "Although"
      },
      {
        prompt: "Example: ___ you revise daily, your grammar will improve.",
        steps: [
          "The first clause sets a condition.",
          "Condition connector is needed.",
          "Use 'If'."
        ],
        answer: "If"
      },
      {
        prompt: "Example: You cannot enter ___ you wear the lab coat.",
        steps: [
          "Meaning is 'except if'.",
          "That matches 'unless'.",
          "Use 'unless'."
        ],
        answer: "unless"
      },
      {
        prompt: "Example: Bring an umbrella ___ it rains later.",
        steps: [
          "Sentence shows prevention for a possible event.",
          "Use the phrase 'in case'.",
          "Insert 'in case'."
        ],
        answer: "in case"
      },
      {
        prompt: "Example: The hall was warm ___ all windows were closed.",
        steps: [
          "Second clause gives reason.",
          "Reason connector is needed.",
          "Use 'because'."
        ],
        answer: "because"
      },
      {
        prompt: "Example: ___ she was tired, she finished her homework neatly.",
        steps: [
          "This is a contrast situation.",
          "Tired but still completed homework.",
          "Use 'Although'."
        ],
        answer: "Although"
      }
    ],
    phrasal_verbs: [
      {
        prompt: "Example: Their treehouse plan ___ because of poor teamwork.",
        steps: [
          "Meaning needed: did not happen.",
          "The phrasal verb for this is 'fell through'.",
          "Use 'fell through'."
        ],
        answer: "fell through"
      },
      {
        prompt: "Example: Please ___ your shoes before entering the hall.",
        steps: [
          "Meaning needed: remove shoes.",
          "The phrasal verb is 'take off'.",
          "Insert 'take off'."
        ],
        answer: "take off"
      },
      {
        prompt: "Example: Can you ___ this word in the dictionary?",
        steps: [
          "Meaning needed: search for information.",
          "The phrasal verb is 'look up'.",
          "Use 'look up'."
        ],
        answer: "look up"
      },
      {
        prompt: "Example: We need to ___ a better revision plan.",
        steps: [
          "Meaning needed: think of an idea.",
          "Phrasal verb is 'come up with'.",
          "Write 'come up with'."
        ],
        answer: "come up with"
      },
      {
        prompt: "Example: Do not ___ stories. Tell the truth.",
        steps: [
          "Meaning needed: invent stories.",
          "Phrasal verb is 'make up'.",
          "Use 'make up'."
        ],
        answer: "make up"
      },
      {
        prompt: "Example: Please ___ while I check your answer.",
        steps: [
          "Meaning needed: wait for a short time.",
          "Phrasal verb is 'hold on'.",
          "Use 'hold on'."
        ],
        answer: "hold on"
      }
    ],
    study_habits: [
      {
        prompt: "Example: Which revision plan is strongest? 30 minutes daily or 3 hours once a week?",
        steps: [
          "Frequent review helps memory stay active.",
          "Very long gaps weaken recall.",
          "Choose the daily routine."
        ],
        answer: "30 minutes daily"
      },
      {
        prompt: "Example: After a mistake, what should you write in your notebook?",
        steps: [
          "Record the wrong answer quickly.",
          "Write the correct answer and one fix rule.",
          "Schedule a revisit date."
        ],
        answer: "Wrong answer + correct answer + fix rule"
      },
      {
        prompt: "Example: Why should you do active recall?",
        steps: [
          "Active recall means testing memory without looking.",
          "This strengthens long-term retention.",
          "Use short self-quizzes regularly."
        ],
        answer: "It strengthens memory recall"
      },
      {
        prompt: "Example: What is a good cloze checking routine?",
        steps: [
          "Read full sentence.",
          "Find grammar signal near blank.",
          "Choose answer and re-read."
        ],
        answer: "Read, signal, choose, re-read"
      },
      {
        prompt: "Example: Should you skip hard questions immediately?",
        steps: [
          "Try a short clue check first.",
          "If still unsure, mark and return later.",
          "Use time wisely."
        ],
        answer: "Try clue check, then mark and return"
      },
      {
        prompt: "Example: How can you avoid repeating the same grammar mistake?",
        steps: [
          "Keep a mistake log.",
          "Review it in spaced intervals.",
          "Practise similar questions the next day."
        ],
        answer: "Use notebook + spaced review"
      }
    ],
    exam_strategy: [
      {
        prompt: "Example: In cloze, should you pick an answer before reading the full sentence?",
        steps: [
          "Reading the full frame gives context.",
          "Context reveals word class and logic.",
          "Read first, then choose."
        ],
        answer: "Read full sentence first"
      },
      {
        prompt: "Example: Two options both look possible. What do you check next?",
        steps: [
          "Check grammar form (noun/verb/preposition).",
          "Check collocation or fixed phrase.",
          "Choose the option that fits both."
        ],
        answer: "Check grammar form and collocation"
      },
      {
        prompt: "Example: How long should your final blank check take in exam?",
        steps: [
          "Use a quick check, not a long pause.",
          "Five seconds is enough for grammar and meaning.",
          "Move on after checking."
        ],
        answer: "About 5 seconds"
      },
      {
        prompt: "Example: You see two past actions in one sentence. What should you test?",
        steps: [
          "Identify earlier action and later action.",
          "Earlier action may need past perfect.",
          "Use timeline check before final answer."
        ],
        answer: "Check if earlier action needs past perfect"
      },
      {
        prompt: "Example: How do you avoid connector mistakes quickly?",
        steps: [
          "Ask: contrast, reason, condition, or time?",
          "Test grammar structure after connector.",
          "Pick the connector matching both."
        ],
        answer: "Match logic + grammar structure"
      },
      {
        prompt: "Example: What should you do when stuck for too long on one blank?",
        steps: [
          "Mark the blank lightly.",
          "Continue to next item.",
          "Return with fresh context later."
        ],
        answer: "Mark and return later"
      }
    ],
    composition: [
      {
        prompt: "Example: Build a topic sentence about teamwork.",
        steps: [
          "Choose one clear idea.",
          "State it in one complete sentence.",
          "Keep tense and subject clear."
        ],
        answer: "Teamwork helped us solve the challenge quickly."
      },
      {
        prompt: "Example: Improve this sentence with contrast: We were tired. We kept going.",
        steps: [
          "Find relationship: contrast.",
          "Use connector 'Although'.",
          "Combine into one clear sentence."
        ],
        answer: "Although we were tired, we kept going."
      },
      {
        prompt: "Example: Replace weak verb in 'The boy went to help his friend.'",
        steps: [
          "Spot plain verb 'went'.",
          "Choose vivid action verb based on speed.",
          "Rebuild sentence with stronger verb."
        ],
        answer: "The boy raced to help his friend."
      },
      {
        prompt: "Example: Write a reflective ending sentence.",
        steps: [
          "Think about lesson learnt.",
          "State change in thinking or behaviour.",
          "Keep it concise and meaningful."
        ],
        answer: "From that day, I learned that courage grows when we help one another."
      },
      {
        prompt: "Example: Arrange paragraph flow for a story.",
        steps: [
          "Start with setting and situation.",
          "Show problem and actions taken.",
          "End with result and reflection."
        ],
        answer: "Setting -> problem -> actions -> ending reflection"
      },
      {
        prompt: "Example: Keep tense consistent in a past-time story.",
        steps: [
          "Check first verb tense.",
          "Keep related actions in same timeline.",
          "Fix any verb that shifts wrongly."
        ],
        answer: "Use consistent past tense unless timeline demands change"
      }
    ]
  };

  function chapterForPage(pageNo) {
    for (var i = 0; i < CHAPTERS.length; i += 1) {
      if (pageNo >= CHAPTERS[i].startPage && pageNo <= CHAPTERS[i].endPage) {
        return CHAPTERS[i];
      }
    }
    return CHAPTERS[CHAPTERS.length - 1];
  }

  function pickFrom(list, seed) {
    return list[seed % list.length];
  }

  function fallbackTag(tag) {
    if (ITEM_BANK[tag]) {
      return tag;
    }
    return "function_words";
  }

  function chapterPrimaryTag(chapter, offset, pageNo, isBooster) {
    if (isBooster) {
      return WEAK_TAGS[(Math.floor(pageNo / 10) - 1 + WEAK_TAGS.length) % WEAK_TAGS.length];
    }
    return chapter.focusTags[offset % chapter.focusTags.length];
  }

  function uniqueTags(list) {
    var out = [];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i] && out.indexOf(list[i]) === -1) {
        out.push(list[i]);
      }
    }
    return out;
  }

  function buildTitle(chapter, pageNo, offset, isBooster) {
    if (isBooster) {
      var boosterIndex = Math.floor(pageNo / 10) - 1;
      return "Booster Review " + (boosterIndex + 1) + ": " + BOOSTER_NAMES[boosterIndex % BOOSTER_NAMES.length];
    }
    var core = LESSON_TITLES[(pageNo + offset) % LESSON_TITLES.length];
    return chapter.shortTitle + " Lesson " + (offset + 1) + ": " + core;
  }

  function buildLearningGoal(tag, isBooster) {
    if (isBooster) {
      return "I can combine different grammar skills and explain why my answer fits both meaning and sentence form.";
    }
    return "I can " + TAG_RULES[tag].goal + ".";
  }

  function buildTeachText(tag, pageNo, isBooster) {
    if (isBooster) {
      return "This booster page mixes your key weak areas. Use this routine: read the full sentence, spot grammar clues, choose, then do a five-second check for meaning and form.";
    }
    var reminder = pageNo % 2 === 0
      ? "Always check the words next to the blank before you lock your answer."
      : "After choosing, read the whole sentence again to make sure it sounds natural and correct.";
    return TAG_RULES[tag].teach + " " + reminder;
  }

  function cloneWorkedExampleTemplate(template) {
    return {
      prompt: template.prompt,
      steps: template.steps.slice(),
      answer: template.answer
    };
  }

  function pickWorkedExampleForTag(tag, seed, used) {
    var realTag = fallbackTag(tag);
    var bank = WORKED_EXAMPLE_BANK[realTag] || WORKED_EXAMPLE_BANK.function_words;
    var start = seed % bank.length;

    for (var i = 0; i < bank.length; i += 1) {
      var idx = (start + i) % bank.length;
      var key = realTag + "_" + idx;
      if (!used[key] || bank.length === 1) {
        used[key] = true;
        return cloneWorkedExampleTemplate(bank[idx]);
      }
    }

    return cloneWorkedExampleTemplate(bank[0]);
  }

  function buildWorkedExamples(tag, pageNo, isBooster, chapter) {
    var examples = [];
    var used = {};

    if (isBooster) {
      for (var i = 0; i < 4; i += 1) {
        var boosterTag = WEAK_TAGS[(Math.floor(pageNo / 10) + i) % WEAK_TAGS.length];
        examples.push(pickWorkedExampleForTag(boosterTag, pageNo * 11 + i * 7, used));
      }
      return examples;
    }

    var mainTag = fallbackTag(tag);
    for (var j = 0; j < 3; j += 1) {
      examples.push(pickWorkedExampleForTag(mainTag, pageNo * 9 + j * 5, used));
    }

    var supportTag = fallbackTag(chapter.focusTags[(pageNo + 1) % chapter.focusTags.length]);
    if (supportTag === mainTag) {
      supportTag = WEAK_TAGS[(pageNo + 3) % WEAK_TAGS.length];
    }
    examples.push(pickWorkedExampleForTag(supportTag, pageNo * 13 + 17, used));

    return examples;
  }

  function cloneItem(template, id, tag) {
    var item = {
      id: id,
      type: template.type,
      prompt: template.prompt,
      answer: template.answer,
      explanation: template.explanation,
      hint: template.hint,
      tag: tag
    };
    if (template.options) {
      item.options = template.options.slice();
    }
    return item;
  }

  function pickItem(tag, seed, idPrefix) {
    var realTag = fallbackTag(tag);
    var bank = ITEM_BANK[realTag];
    var template = bank[seed % bank.length];
    return cloneItem(template, idPrefix + "_" + realTag + "_" + seed, realTag);
  }

  function buildPracticeItems(pageNo, chapter, primaryTag, isBooster) {
    var items = [];
    if (isBooster) {
      var tagA = WEAK_TAGS[(pageNo / 10 + 1) % WEAK_TAGS.length];
      var tagB = WEAK_TAGS[(pageNo / 10 + 4) % WEAK_TAGS.length];
      items.push(pickItem(tagA, pageNo + 3, "p" + pageNo + "a"));
      items.push(pickItem(tagB, pageNo + 7, "p" + pageNo + "b"));
      return items;
    }

    var secondarySource = chapter.focusTags[(pageNo + 1) % chapter.focusTags.length];
    var secondaryTag = fallbackTag(secondarySource);
    var finalSecondaryTag = secondaryTag === fallbackTag(primaryTag)
      ? WEAK_TAGS[(pageNo + 2) % WEAK_TAGS.length]
      : secondaryTag;

    items.push(pickItem(primaryTag, pageNo + 2, "p" + pageNo + "a"));
    items.push(pickItem(finalSecondaryTag, pageNo + 6, "p" + pageNo + "b"));
    return items;
  }

  function buildCommonMistake(tag, isBooster) {
    if (isBooster) {
      return "Mixing meaning clues and grammar clues. Solve one sentence at a time, then re-check the full sentence.";
    }
    return TAG_RULES[tag].mistake;
  }

  function buildRecap(tag, isBooster) {
    if (isBooster) {
      return "Read. Signal. Choose. Re-check. That four-step loop keeps mistakes low.";
    }
    return TAG_RULES[tag].recap;
  }

  function pageTags(chapter, primaryTag, isBooster) {
    var base = [primaryTag].concat(chapter.focusTags);
    if (isBooster) {
      base = base.concat(WEAK_TAGS);
    }
    var tags = uniqueTags(base);
    var cleaned = [];
    for (var i = 0; i < tags.length; i += 1) {
      cleaned.push(fallbackTag(tags[i]));
    }
    return uniqueTags(cleaned);
  }

  function buildPage(pageNo) {
    var chapter = chapterForPage(pageNo);
    var offset = pageNo - chapter.startPage;
    var isBooster = pageNo % 10 === 0;
    var rawTag = chapterPrimaryTag(chapter, offset, pageNo, isBooster);
    var mainTag = fallbackTag(rawTag);

    return {
      pageNo: pageNo,
      chapterId: chapter.id,
      title: buildTitle(chapter, pageNo, offset, isBooster),
      learningGoal: buildLearningGoal(mainTag, isBooster),
      teachText: buildTeachText(mainTag, pageNo, isBooster),
      workedExamples: buildWorkedExamples(mainTag, pageNo, isBooster, chapter),
      practiceItems: buildPracticeItems(pageNo, chapter, mainTag, isBooster),
      commonMistake: buildCommonMistake(mainTag, isBooster),
      recap: buildRecap(mainTag, isBooster),
      tags: pageTags(chapter, mainTag, isBooster),
      isBooster: isBooster
    };
  }

  var PAGES = [];
  for (var pageNo = 1; pageNo <= BOOK_META.totalPages; pageNo += 1) {
    PAGES.push(buildPage(pageNo));
  }

  window.PSLE_ENGLISH_BOOK = {
    BOOK_META: BOOK_META,
    CHAPTERS: CHAPTERS,
    PAGES: PAGES,
    WEAK_TAGS: WEAK_TAGS,
    TAG_RULES: TAG_RULES
  };
})();
