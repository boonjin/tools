#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(ROOT, "data");
const SUBSKILLS_ROOT = path.join(DATA_ROOT, "subskills");

const EXAMPLES_PER_SUBSKILL = 201;
const QUESTIONS_PER_FORMAT = 201;

const PRACTICE_FORMATS = [
  "multiple_choice_grammar",
  "grammar_cloze",
  "editing_spelling_grammar",
  "synthesis_transformation",
  "short_writing_application"
];

function subskill(id, title, focus, wrongOptions, rule, shortcut, tip, commonConfusion, keywords) {
  return {
    id,
    title,
    focus,
    wrongOptions,
    rule,
    shortcut,
    tip,
    commonConfusion,
    keywords
  };
}

const MODULES = [
  {
    id: "word_level_accuracy",
    title: "Word-level accuracy",
    topics: [
      {
        id: "nouns",
        title: "Nouns",
        subskills: [
          subskill(
            "nouns_plural_rules",
            "Plural rules",
            "children",
            ["childs", "child", "childes"],
            "Use the correct irregular or regular plural form for the noun.",
            "Check if the noun is singular or plural before choosing.",
            "Look for clues like two, many, several, and both.",
            "Many pupils add -s to irregular nouns, which is often wrong.",
            ["plural", "irregular nouns", "number"]
          ),
          subskill(
            "nouns_countable_uncountable",
            "Countable and uncountable nouns",
            "many",
            ["much", "few", "several"],
            "Use countable quantifiers for countable nouns and uncountable quantifiers for mass nouns.",
            "Ask: can I count this item one by one?",
            "Rice and water are usually uncountable; apples and books are countable.",
            "The word many sounds natural with plural count nouns, not mass nouns.",
            ["countable", "uncountable", "quantifier"]
          ),
          subskill(
            "nouns_possessives",
            "Possessives",
            "'s",
            ["s'", "of", "'"],
            "Use apostrophes correctly to show ownership.",
            "Owner first, then apostrophe pattern.",
            "For one owner, use 's. For plural owners ending in s, use s'.",
            "Many pupils confuse plurals with possessives.",
            ["apostrophe", "ownership", "noun form"]
          ),
          subskill(
            "nouns_much_many_error",
            "Common error: much vs many",
            "many",
            ["much", "little", "less"],
            "Use many with plural count nouns and much with uncountable nouns.",
            "Pair many with count nouns like books, coins, and pens.",
            "Read the noun after the blank; it usually tells you the answer.",
            "Much may sound formal but is wrong with many countable nouns.",
            ["much", "many", "count nouns"]
          ),
          subskill(
            "nouns_fewer_less_error",
            "Common error: fewer vs less",
            "fewer",
            ["less", "few", "little"],
            "Use fewer for countable plural nouns and less for uncountable nouns.",
            "Count items? Use fewer.",
            "Try counting in your head to check quickly.",
            "Students choose less because they hear it often in speech.",
            ["fewer", "less", "countable"]
          )
        ]
      },
      {
        id: "pronouns",
        title: "Pronouns",
        subskills: [
          subskill(
            "pronouns_case_forms",
            "Case forms (who/whom, I/me, he/him)",
            "whom",
            ["who", "he", "him"],
            "Use subject pronouns as subjects and object pronouns as objects.",
            "Find the job of the pronoun: subject or object.",
            "If the pronoun receives the action, object form is needed.",
            "Who sounds natural in speech, but whom is needed in object position.",
            ["pronoun case", "who whom", "subject object"]
          ),
          subskill(
            "pronouns_reference_clarity",
            "Reference clarity",
            "they",
            ["it", "he", "she"],
            "A pronoun must clearly point to one suitable noun.",
            "If unclear, replace pronoun with the noun.",
            "Clear reference prevents meaning confusion.",
            "Students use it or they when there are many possible nouns.",
            ["reference", "clarity", "pronoun"]
          ),
          subskill(
            "pronouns_agreement",
            "Pronoun agreement",
            "their",
            ["his", "her", "its"],
            "Match pronoun number with the noun it refers to.",
            "Singular noun, singular pronoun; plural noun, plural pronoun.",
            "Check both noun and pronoun before final answer.",
            "A nearby noun may distract you from the true reference noun.",
            ["agreement", "pronoun", "number"]
          ),
          subskill(
            "pronouns_ambiguous_it_they",
            "Common error: ambiguous it/they",
            "the device",
            ["it", "they", "them"],
            "Avoid ambiguous pronouns by naming the noun when needed.",
            "If two nouns can match, use the actual noun once.",
            "Clear nouns improve precision in exam writing.",
            "Students overuse pronouns and make sentences unclear.",
            ["ambiguity", "it", "they"]
          ),
          subskill(
            "pronouns_me_and_my_friend",
            "Common error: me and my friend",
            "my friend and I",
            ["me and my friend", "my friend and me", "I and my friend"],
            "Use my friend and I as a subject, and my friend and me as an object.",
            "Remove my friend and test the pronoun alone.",
            "I went is correct, so my friend and I went is correct.",
            "Students choose me because it sounds casual in speech.",
            ["compound subject", "I me", "pronoun case"]
          )
        ]
      },
      {
        id: "determiners_quantifiers",
        title: "Determiners and quantifiers",
        subskills: [
          subskill(
            "determiners_articles",
            "Articles (a, an, the)",
            "an",
            ["a", "the", "some"],
            "Use an before a vowel sound, a before a consonant sound, and the for specific nouns.",
            "Listen to the sound, not only the first letter.",
            "The is for something specific and known in context.",
            "Students choose by spelling and ignore pronunciation.",
            ["articles", "a an the", "determiners"]
          ),
          subskill(
            "determiners_some_any",
            "Some and any",
            "some",
            ["any", "no", "many"],
            "Use some in positive statements and any in most negatives and questions.",
            "Positive sentence usually takes some.",
            "In offers and requests, some can appear in questions.",
            "Any is often overused in all sentence types.",
            ["some any", "determiners", "sentence type"]
          ),
          subskill(
            "determiners_each_every_either_neither",
            "Each, every, either, neither",
            "each",
            ["every", "either", "neither"],
            "Choose the determiner that matches meaning and grammar structure.",
            "Each often highlights individuals in a group.",
            "Neither is negative and usually pairs with singular verbs.",
            "Students mix each and every when meaning differs.",
            ["each every", "either neither", "determiner meaning"]
          ),
          subskill(
            "determiners_a_an_misuse",
            "Common error: a/an misuse",
            "an",
            ["a", "the", "no article"],
            "The a/an choice depends on the next sound.",
            "If you hear a vowel sound, choose an.",
            "Words like hour need an because h is silent.",
            "Spelling misleads students in words like university and hour.",
            ["a an", "vowel sound", "article error"]
          ),
          subskill(
            "determiners_less_vs_fewer",
            "Common error: less vs fewer",
            "fewer",
            ["less", "little", "few"],
            "Use fewer for countable items and less for uncountable amounts.",
            "Countable plural nouns usually need fewer.",
            "Use less with time, money, and uncountable mass nouns.",
            "Less is common in speech, so pupils overuse it in formal grammar.",
            ["less fewer", "quantifier", "countable"]
          )
        ]
      },
      {
        id: "adjectives_adverbs",
        title: "Adjectives and adverbs",
        subskills: [
          subskill(
            "adjadv_form",
            "Form: adjective vs adverb",
            "quickly",
            ["quick", "quickness", "quicker"],
            "Use adjectives to describe nouns and adverbs to describe verbs.",
            "Ask what the word describes: noun or action.",
            "Most adverbs end in -ly, but not all.",
            "Students choose adjectives after action verbs.",
            ["adjective", "adverb", "word form"]
          ),
          subskill(
            "adjadv_placement",
            "Placement of adjectives and adverbs",
            "carefully",
            ["careful", "carefuller", "care"] ,
            "Place modifiers where meaning is clear and grammatical.",
            "Adverbs usually sit near the verb they modify.",
            "Adjectives usually appear before nouns or after linking verbs.",
            "Wrong placement can change meaning.",
            ["placement", "modifier", "clarity"]
          ),
          subskill(
            "adjadv_comparatives",
            "Comparatives",
            "better",
            ["more better", "best", "good"],
            "Use the correct comparative form for two-way comparisons.",
            "Two things: use comparative, not superlative.",
            "Irregular forms include good-better-best.",
            "Students add more before irregular comparatives.",
            ["comparative", "irregular", "comparison"]
          ),
          subskill(
            "adjadv_good_well_error",
            "Common error: good vs well",
            "well",
            ["good", "best", "better"],
            "Use well as an adverb for actions; good is usually an adjective.",
            "If it describes how someone performs an action, use well.",
            "After linking verbs, good may be correct for condition.",
            "Students use good after action verbs.",
            ["good well", "adverb", "action"]
          ),
          subskill(
            "adjadv_more_better_error",
            "Common error: more better",
            "better",
            ["more better", "more good", "best"],
            "Do not use double comparatives like more better.",
            "Use one comparative marker only.",
            "Irregular comparatives already carry comparison meaning.",
            "Students add more to every comparative form.",
            ["double comparative", "better", "error correction"]
          )
        ]
      },
      {
        id: "prepositions",
        title: "Prepositions",
        subskills: [
          subskill(
            "prep_time",
            "Prepositions of time",
            "at",
            ["in", "on", "by"],
            "Use prepositions that match the time expression.",
            "At for clock time, on for days, in for months and years.",
            "Read the full time phrase before choosing.",
            "Students overuse in with exact times.",
            ["time preposition", "at on in", "clue words"]
          ),
          subskill(
            "prep_place",
            "Prepositions of place",
            "in",
            ["on", "at", "into"],
            "Choose place prepositions based on position and boundary.",
            "In means inside a space; on means touching a surface.",
            "At often marks a point location.",
            "Students confuse in and at for location points.",
            ["place preposition", "position", "boundary"]
          ),
          subskill(
            "prep_movement",
            "Prepositions of movement",
            "into",
            ["in", "onto", "at"],
            "Use movement prepositions for direction and change of position.",
            "Into shows movement from outside to inside.",
            "On and onto differ by whether movement happens.",
            "Students choose static prepositions when movement is shown.",
            ["movement", "direction", "into onto"]
          ),
          subskill(
            "prep_common_patterns",
            "Common preposition patterns",
            "interested in",
            ["interested on", "interested at", "interested for"],
            "Some verbs and adjectives take fixed prepositions.",
            "Learn common chunks as one unit.",
            "Use collocation memory to reduce errors.",
            "Students swap prepositions in fixed phrases.",
            ["collocation", "pattern", "preposition phrase"]
          ),
          subskill(
            "prep_in_on_at_confusion",
            "Common error: in/on/at confusion",
            "on",
            ["in", "at", "into"],
            "In, on, and at each signal different space or time relationships.",
            "Check whether the noun is a surface, container, or point.",
            "Use location logic first, then sound.",
            "Students choose based on habit, not meaning.",
            ["in on at", "common error", "preposition logic"]
          )
        ]
      },
      {
        id: "conjunctions_linkers",
        title: "Conjunctions and linkers",
        subskills: [
          subskill(
            "conj_coordinating",
            "Coordinating conjunctions",
            "but",
            ["because", "although", "unless"],
            "Use coordinating conjunctions to join equal clauses.",
            "For, and, nor, but, or, yet, so join balanced clauses.",
            "Check punctuation when joining full clauses.",
            "Students use coordinating linkers where subordination is needed.",
            ["coordinating", "clause joining", "logic"]
          ),
          subskill(
            "conj_subordinating",
            "Subordinating conjunctions",
            "because",
            ["but", "or", "so"],
            "Use subordinators to link a dependent clause to a main clause.",
            "Subordinate clauses cannot stand alone.",
            "Choose conjunction by meaning: reason, time, condition, contrast.",
            "Students join with because but forget clause structure.",
            ["subordinating", "dependent clause", "connector"]
          ),
          subskill(
            "conj_correlative",
            "Correlative conjunctions",
            "either...or",
            ["either...and", "both...or", "neither...and"],
            "Correlative pairs must stay in matching pairs.",
            "Use parallel structure after both halves.",
            "Check agreement near the verb for either...or and neither...nor.",
            "Students mix two different pair systems.",
            ["correlative", "pairing", "parallel"]
          ),
          subskill(
            "conj_run_ons",
            "Common error: run-on sentences",
            "period",
            ["comma only", "and only", "no punctuation"],
            "Separate complete ideas correctly with punctuation or conjunctions.",
            "If both sides are complete sentences, join carefully.",
            "Use a period when unsure.",
            "Students join long ideas with no boundary.",
            ["run on", "sentence boundary", "punctuation"]
          ),
          subskill(
            "conj_because_so_together",
            "Common error: because ... so together",
            "because",
            ["because so", "so because", "therefore because"],
            "Use because or so/therefore, not both in the same cause-result structure.",
            "Choose one cause-result linker pattern.",
            "Read the sentence once to spot double-linking.",
            "Students stack two linkers for one relationship.",
            ["because so", "double linker", "cause result"]
          )
        ]
      }
    ]
  },
  {
    id: "verb_level_accuracy",
    title: "Verb-level accuracy",
    topics: [
      {
        id: "subject_verb_agreement",
        title: "Subject-verb agreement",
        subskills: [
          subskill(
            "sva_singular_plural",
            "Singular and plural agreement",
            "is",
            ["are", "were", "have"],
            "Match the verb to the true subject number.",
            "Find the subject before choosing the verb.",
            "Ignore extra phrases between subject and verb.",
            "Students match the verb to the nearest noun instead.",
            ["subject verb agreement", "singular", "plural"]
          ),
          subskill(
            "sva_tricky_subjects",
            "Tricky subjects",
            "has",
            ["have", "are", "were"],
            "Identify the head noun in complex subject phrases.",
            "Ignore of-phrases when choosing the main verb.",
            "Each and every usually take singular verbs.",
            "Students are distracted by plural words inside phrases.",
            ["tricky subject", "head noun", "agreement"]
          ),
          subskill(
            "sva_each_every_error",
            "Common error: each/every",
            "has",
            ["have", "had", "are"],
            "Each and every are singular in agreement.",
            "Treat each as one item at a time.",
            "Check if each of is followed by a plural noun but singular verb.",
            "Students use plural verbs after each of.",
            ["each", "every", "agreement error"]
          ),
          subskill(
            "sva_collective_nouns",
            "Common error: collective nouns",
            "is",
            ["are", "were", "have"],
            "Collective nouns are often treated as singular in PSLE grammar contexts.",
            "Ask whether the group acts as one unit.",
            "If one unit, use singular verb.",
            "Students use plural verbs because the group has many members.",
            ["collective noun", "team", "agreement"]
          )
        ]
      },
      {
        id: "tenses_aspect",
        title: "Tenses and aspect",
        subskills: [
          subskill(
            "tenses_present_past_future_forms",
            "Present, past, and future forms",
            "went",
            ["go", "gone", "going"],
            "Choose tense form that matches time clues and sentence context.",
            "Find time words first.",
            "Past markers like yesterday usually require past forms.",
            "Students choose base forms despite clear time clues.",
            ["tense", "time marker", "verb form"]
          ),
          subskill(
            "tenses_consistency",
            "Tense consistency",
            "was",
            ["is", "were", "has been"],
            "Keep verbs in a consistent timeline unless time shifts clearly.",
            "Check if all actions are in the same time frame.",
            "Shift tense only when the timeline truly changes.",
            "Students switch tense midway without reason.",
            ["consistency", "timeline", "tense control"]
          ),
          subskill(
            "tenses_shift_error",
            "Common error: tense shifts",
            "were",
            ["are", "is", "have been"],
            "Unplanned tense shifts break timeline clarity.",
            "Underline time clues and keep matching tense.",
            "If context is past, keep past unless there is a valid shift.",
            "Students drift into present tense in story writing.",
            ["tense shift", "error", "timeline"]
          ),
          subskill(
            "tenses_has_have_confusion",
            "Common error: has/have confusion",
            "has",
            ["have", "had", "having"],
            "Use has with singular third-person subjects and have with plural subjects.",
            "Check subject number before has/have.",
            "Pronouns he, she, and it usually pair with has.",
            "Students copy have from nearby plural nouns.",
            ["has have", "present perfect", "agreement"]
          )
        ]
      },
      {
        id: "modals",
        title: "Modals",
        subskills: [
          subskill(
            "modals_meanings",
            "Modal meanings",
            "should",
            ["must", "might", "can"],
            "Pick modals by meaning: advice, possibility, permission, or obligation.",
            "Decide the message first, then choose modal.",
            "Should often gives advice in PSLE items.",
            "Students choose strong modals when advice is intended.",
            ["modals", "meaning", "advice"]
          ),
          subskill(
            "modals_base_verb_after_modal",
            "Base verb after modal",
            "go",
            ["goes", "went", "going"],
            "Use base verb form after modal verbs.",
            "Modal + base verb is the pattern.",
            "Do not add to or tense endings after modals.",
            "Students add past tense after can or should.",
            ["modal + base", "verb pattern", "form"]
          ),
          subskill(
            "modals_must_to_error",
            "Common error: must to",
            "must",
            ["must to", "musts", "musted"],
            "Must is followed directly by a base verb, without to.",
            "Say must + base verb only.",
            "Remove to after must.",
            "Students copy patterns from need to and want to.",
            ["must", "to", "modal error"]
          ),
          subskill(
            "modals_can_past_tense_error",
            "Common error: can + past tense",
            "could",
            ["can went", "can did", "can gone"],
            "After can, use base verb; use could for past ability contexts.",
            "Check whether the sentence is present or past context.",
            "Do not place past tense verbs directly after can.",
            "Students combine can with past-tense verbs.",
            ["can could", "base verb", "modal error"]
          )
        ]
      },
      {
        id: "verb_patterns",
        title: "Verb patterns",
        subskills: [
          subskill(
            "verb_patterns_to_infinitive_vs_ing",
            "To-infinitive vs -ing",
            "swimming",
            ["to swim", "swim", "swam"],
            "Some verbs are followed by to-infinitive, others by -ing form.",
            "Memorise high-frequency verb patterns.",
            "Check the verb before the blank for pattern clues.",
            "Students mix to-infinitive and gerund patterns.",
            ["verb pattern", "infinitive", "gerund"]
          ),
          subskill(
            "verb_patterns_stop_remember_contrasts",
            "Stop/remember contrasts",
            "remember to",
            ["remember", "remembering", "remembered to"],
            "Stop and remember change meaning depending on to-infinitive or -ing.",
            "Remember to do = do it later; remember doing = memory of earlier action.",
            "Stop doing = cease action; stop to do = pause for another action.",
            "Students know words but miss pattern meaning shift.",
            ["stop", "remember", "meaning shift"]
          ),
          subskill(
            "verb_patterns_enjoy_to_error",
            "Common error: enjoy to",
            "enjoys",
            ["enjoy to", "enjoyed to", "enjoying to"],
            "Enjoy is usually followed by -ing, not to-infinitive.",
            "Enjoy + -ing is the safe pattern.",
            "Check collocation after enjoy.",
            "Students copy to-infinitive after every verb.",
            ["enjoy", "gerund", "error"]
          ),
          subskill(
            "verb_patterns_stop_to_doing_error",
            "Common error: stop to doing",
            "stopped to",
            ["stopped doing", "stop to doing", "stopping to do"],
            "Use stop to + base verb for pause-and-purpose meaning.",
            "Pause first, then second action.",
            "Check whether sentence means cease or pause for purpose.",
            "Students blend two valid structures into one invalid form.",
            ["stop to", "stop doing", "pattern error"]
          )
        ]
      },
      {
        id: "passive_voice",
        title: "Passive voice",
        subskills: [
          subskill(
            "passive_be_past_participle",
            "Be + past participle",
            "was written",
            ["written", "was write", "is wrote"],
            "Passive voice uses the correct be-form plus past participle.",
            "Check tense first, then choose be-form.",
            "Past participle must follow be in passive patterns.",
            "Students use base or past form instead of past participle.",
            ["passive", "be + pp", "structure"]
          ),
          subskill(
            "passive_tense_preservation",
            "Tense preservation in passive",
            "had been built",
            ["had built", "has been build", "was been built"],
            "Keep the same timeline when changing active to passive.",
            "Map active tense to equivalent passive tense.",
            "Do not change time meaning while transforming voice.",
            "Students keep meaning but lose correct tense form.",
            ["passive tense", "transformation", "timeline"]
          ),
          subskill(
            "passive_wrong_be_form_error",
            "Common error: wrong be-form",
            "was chosen",
            ["were chosen", "is chosen", "chosen"],
            "Choose be-form that agrees with subject and tense.",
            "Subject number still matters in passive.",
            "Match timeline and subject before final answer.",
            "Students use were with singular subjects.",
            ["be form", "agreement", "passive"]
          ),
          subskill(
            "passive_missing_agent_when_needed",
            "Common error: missing agent when needed",
            "by the coach",
            ["with the coach", "from the coach", "coach"],
            "Add the agent with by when the doer is important.",
            "If who did it matters, include by + agent.",
            "In some sentences, agent can be omitted if obvious.",
            "Students omit agent even when meaning becomes unclear.",
            ["agent", "by phrase", "passive clarity"]
          )
        ]
      }
    ]
  },
  {
    id: "sentence_level_accuracy",
    title: "Sentence-level accuracy",
    topics: [
      {
        id: "sentence_boundaries",
        title: "Sentence boundaries",
        subskills: [
          subskill(
            "sent_simple_structure",
            "Simple sentence structure",
            "Simple sentence",
            ["Fragment", "Run-on", "Comma splice"],
            "A simple sentence has one complete independent clause.",
            "Check for one complete subject-verb idea.",
            "Even short sentences need a full clause.",
            "Students mistake short fragments for complete sentences.",
            ["simple sentence", "clause", "boundary"]
          ),
          subskill(
            "sent_compound_structure",
            "Compound sentence structure",
            "Compound sentence",
            ["Simple sentence", "Fragment", "Complex sentence"],
            "A compound sentence joins two independent clauses correctly.",
            "Use coordinating conjunctions or semicolons properly.",
            "Both sides must stand alone as full clauses.",
            "Students join one full clause with one fragment.",
            ["compound", "independent clause", "connector"]
          ),
          subskill(
            "sent_complex_structure",
            "Complex sentence structure",
            "Complex sentence",
            ["Simple sentence", "Run-on", "Phrase only"],
            "A complex sentence has one main clause and at least one subordinate clause.",
            "Look for subordinators like because, although, and when.",
            "Check that the main clause can stand alone.",
            "Students write subordinate clauses without a main clause.",
            ["complex", "main clause", "subordinate clause"]
          ),
          subskill(
            "sent_avoid_fragments",
            "Avoid fragments",
            "Complete clause",
            ["Phrase", "Subordinator only", "Noun group"],
            "A fragment lacks a full subject-verb idea.",
            "Add the missing subject, verb, or main clause.",
            "If it cannot stand alone, it is not complete.",
            "Students stop sentences too early after a subordinator.",
            ["fragment", "complete thought", "repair"]
          ),
          subskill(
            "sent_avoid_runons_comma_splice",
            "Avoid run-ons and comma splices",
            "period",
            ["comma only", "no punctuation", "and then"],
            "Separate two full clauses with proper punctuation or conjunction.",
            "Use period, semicolon, or conjunction with comma.",
            "Comma alone cannot join full sentences.",
            "Students use comma as a weak full stop.",
            ["run-on", "comma splice", "boundary"]
          )
        ]
      },
      {
        id: "clauses",
        title: "Clauses",
        subskills: [
          subskill(
            "clauses_main_clause",
            "Main clauses",
            "main clause",
            ["subordinate clause", "phrase", "fragment"],
            "A main clause can stand alone as a complete sentence.",
            "Check if the clause works by itself.",
            "Main clauses carry the core message.",
            "Students mark long clauses as subordinate by mistake.",
            ["main clause", "independent", "sentence core"]
          ),
          subskill(
            "clauses_subordinate_clause",
            "Subordinate clauses",
            "subordinate clause",
            ["main clause", "phrase", "run-on"],
            "A subordinate clause depends on a main clause.",
            "Subordinators usually signal subordinate clauses.",
            "Attach subordinate clauses to complete ideas.",
            "Students leave subordinate clauses alone as full sentences.",
            ["subordinate", "dependent", "clause"]
          ),
          subskill(
            "clauses_subordinators",
            "Subordinators",
            "although",
            ["but", "therefore", "and"],
            "Choose subordinators based on meaning and clause structure.",
            "Contrast uses although; reason uses because.",
            "Check whether the connector needs a subordinate clause.",
            "Students choose connectors by sound, not logic.",
            ["subordinator", "connector", "meaning"]
          ),
          subskill(
            "clauses_although_because_misuse",
            "Common error: although/because misuse",
            "although",
            ["because", "although because", "so"],
            "Because gives reason; although gives contrast.",
            "Ask if ideas agree or contrast.",
            "One logical relationship needs one suitable connector.",
            "Students treat although and because as interchangeable.",
            ["although", "because", "logic"]
          )
        ]
      },
      {
        id: "relative_clauses",
        title: "Relative clauses",
        subskills: [
          subskill(
            "relative_who_which_that",
            "Who, which, that",
            "who",
            ["which", "that", "whose"],
            "Use who for people, which for things, and that in many defining clauses.",
            "Identify whether the noun is a person or thing.",
            "Relative pronouns connect nouns to extra information.",
            "Students overuse which for people.",
            ["relative pronoun", "who which that", "noun type"]
          ),
          subskill(
            "relative_whose",
            "Whose",
            "whose",
            ["who", "whom", "which"],
            "Whose shows possession in a relative clause.",
            "Replace of the with whose when natural.",
            "Use whose for both people and things in exam contexts.",
            "Students avoid whose and create awkward phrases.",
            ["whose", "possession", "relative clause"]
          ),
          subskill(
            "relative_comma_control",
            "Comma control in relative clauses",
            "comma",
            ["no comma", "semicolon", "full stop"],
            "Use commas for non-defining relative clauses and omit commas for defining ones.",
            "Ask if the clause is essential to identify the noun.",
            "Non-essential extra detail takes commas.",
            "Students place commas around all relative clauses.",
            ["comma", "defining", "non-defining"]
          ),
          subskill(
            "relative_wrong_pronoun_error",
            "Common error: wrong relative pronoun",
            "that",
            ["who", "whose", "whom"],
            "Choose relative pronoun by noun type and clause role.",
            "Check if pronoun is subject, object, or possessive.",
            "Match pronoun to both meaning and grammar.",
            "Students choose by habit and ignore role in clause.",
            ["relative pronoun", "error correction", "clause role"]
          )
        ]
      },
      {
        id: "parallel_structure",
        title: "Parallel structure",
        subskills: [
          subskill(
            "parallel_lists",
            "Matching forms in lists",
            "to read, to write, and to revise",
            ["to read, writing, and to revise", "read, to write, revising", "to read, to write, revise"],
            "Items in a list should use matching grammar form.",
            "Make all list items nouns, verbs, or phrases in the same pattern.",
            "Parallel form improves clarity and rhythm.",
            "Students change form halfway in a list.",
            ["parallel list", "matching form", "list grammar"]
          ),
          subskill(
            "parallel_pairs",
            "Matching forms in pairs",
            "both...and",
            ["both...or", "either...and", "not only...or"],
            "Correlative pairs require matching structure after both halves.",
            "Check words after each half of the pair.",
            "Parallel pairs prevent awkward sentence shape.",
            "Students use the correct pair but mismatched grammar after it.",
            ["parallel pair", "correlative", "matching"]
          ),
          subskill(
            "parallel_mixed_verb_forms_error",
            "Common error: mixed verb forms",
            "running",
            ["run", "to ran", "runs"],
            "Keep the same verb form across coordinated actions.",
            "If one item is -ing, matching items should also be -ing.",
            "Read the full sequence to catch mismatch.",
            "Students mix base, -ing, and past forms in one structure.",
            ["mixed forms", "verb pattern", "parallel"]
          )
        ]
      },
      {
        id: "questions_negatives",
        title: "Questions and negatives",
        subskills: [
          subskill(
            "qn_inversion",
            "Inversion in questions",
            "Did",
            ["Where he", "He did", "Do he"],
            "Use auxiliary inversion for standard question form.",
            "Question word + auxiliary + subject + base verb.",
            "Check order carefully before punctuation.",
            "Students keep statement order in questions.",
            ["inversion", "question form", "auxiliary"]
          ),
          subskill(
            "qn_do_does_did",
            "do/does/did support",
            "does",
            ["do", "did", "is"],
            "Use do-support auxiliaries for simple present/past questions and negatives.",
            "After does or did, use base verb form.",
            "Choose auxiliary by subject and tense.",
            "Students use third-person -s verb after does.",
            ["do does did", "support verb", "question"]
          ),
          subskill(
            "qn_negatives_structure",
            "Negative structures",
            "do not",
            ["does nots", "did not went", "not do"],
            "Build negatives with the correct auxiliary and base verb.",
            "Auxiliary carries tense; main verb stays in base form.",
            "Contracted and full forms should remain grammatical.",
            "Students place not incorrectly or double-mark tense.",
            ["negative", "auxiliary", "base verb"]
          ),
          subskill(
            "qn_where_he_went_error",
            "Common error: Where he went?",
            "Where did he go",
            ["Where he went", "Where did he went", "Where does he went"],
            "Wh-questions need inversion and base verb after did.",
            "Did must be followed by base form.",
            "Use spoken-order check to catch errors.",
            "Students keep past form after did.",
            ["where did", "question error", "base verb"]
          )
        ]
      },
      {
        id: "speech",
        title: "Speech",
        subskills: [
          subskill(
            "speech_direct_punctuation",
            "Direct speech punctuation",
            "comma and quotation marks",
            ["semicolon only", "no quotation marks", "comma after quote"],
            "Use correct punctuation and quotation marks in direct speech.",
            "Place punctuation correctly around the spoken words.",
            "Start spoken sentence with a capital letter.",
            "Students place commas and quotation marks in wrong positions.",
            ["direct speech", "punctuation", "quotes"]
          ),
          subskill(
            "speech_reported_shifts",
            "Reported speech shifts",
            "had",
            ["has", "have", "is"],
            "Shift tense, pronouns, and time words correctly when reporting speech.",
            "Backshift tense when reporting from a past reporting verb.",
            "Adjust pronouns to match the new speaker viewpoint.",
            "Students copy direct-speech tense into reported speech.",
            ["reported speech", "backshift", "pronoun shift"]
          ),
          subskill(
            "speech_comma_quotes_error",
            "Common error: comma/quotes",
            "comma",
            ["full stop", "semicolon", "no punctuation"],
            "Direct speech tags often need a comma before quotation marks.",
            "Check speech tag position and punctuation pair.",
            "Use one clear punctuation system consistently.",
            "Students use full stops where commas are needed.",
            ["comma", "quotes", "speech error"]
          ),
          subskill(
            "speech_pronoun_time_shift_error",
            "Common error: pronoun/time shift",
            "the next day",
            ["tomorrow", "today", "yesterday"],
            "Change time and pronoun words to match reporting context.",
            "Tomorrow often changes to the next day in reported speech.",
            "Check who speaks and when the report is made.",
            "Students keep original time words from direct speech.",
            ["time shift", "pronoun shift", "reported speech"]
          )
        ]
      }
    ]
  },
  {
    id: "synthesis_transformation",
    title: "Synthesis and transformation",
    topics: [
      {
        id: "patterns",
        title: "Core transformation patterns",
        subskills: [
          subskill(
            "synth_because_so_therefore",
            "because <-> so/therefore",
            "therefore",
            ["because so", "although", "unless"],
            "Transform cause-result structures without changing meaning.",
            "Keep one clear cause and one clear result connector.",
            "If using therefore, remove because in the same clause pair.",
            "Students keep both linkers and create double-linking.",
            ["synthesis", "because", "therefore"]
          ),
          subskill(
            "synth_although_despite",
            "although <-> despite/in spite of",
            "despite",
            ["although of", "because", "so"],
            "Change contrast structures by adjusting grammar after the linker.",
            "Although takes a clause; despite takes a noun phrase or gerund.",
            "Preserve contrast meaning while changing structure.",
            "Students keep a full clause after despite.",
            ["although", "despite", "transformation"]
          ),
          subskill(
            "synth_too_to_so_that_not",
            "too...to <-> so...that...not",
            "so...that...not",
            ["too...that", "so...to", "too...not"],
            "Convert degree-result patterns while keeping meaning.",
            "Too...to usually means not possible; keep that meaning after change.",
            "Check subject and tense when rewriting.",
            "Students change structure but lose original meaning.",
            ["too to", "so that not", "degree"]
          ),
          subskill(
            "synth_as_as_not_as_as",
            "as...as / not as...as",
            "as...as",
            ["more as...as", "not so than", "as...than"],
            "Use equal and unequal comparison structures correctly.",
            "As...as signals equal comparison.",
            "Not as...as signals weaker degree.",
            "Students mix comparative and as...as patterns.",
            ["as as", "comparison", "pattern"]
          ),
          subskill(
            "synth_neither_nor_either_or_both_and_not_only_but_also",
            "neither...nor / either...or / both...and / not only...but also",
            "not only...but also",
            ["not only...and", "both...or", "either...and"],
            "Use correlative pairings correctly and keep parallel structure.",
            "Choose pair by meaning: addition, choice, or exclusion.",
            "Keep grammar form balanced after both halves.",
            "Students mix two pairs in one sentence.",
            ["correlative", "pairing", "parallel"]
          ),
          subskill(
            "synth_prefer_to_would_rather_than",
            "prefer...to / would rather...than",
            "would rather...than",
            ["prefer...than", "would rather...to", "prefer than"],
            "Transform preference structures with correct pairings.",
            "Prefer pairs with to; would rather pairs with than.",
            "Keep verb forms correct after each pattern.",
            "Students switch the second linker incorrectly.",
            ["prefer to", "would rather than", "transformation"]
          ),
          subskill(
            "synth_enough_to_so_that",
            "enough...to / so...that",
            "enough to",
            ["enough that", "so enough", "too enough"],
            "Rewrite ability/result structures while preserving degree meaning.",
            "Enough to is often followed by base verb.",
            "So...that needs a result clause.",
            "Students omit key words when transforming.",
            ["enough to", "so that", "result"]
          ),
          subskill(
            "synth_direct_reported_speech",
            "direct <-> reported speech",
            "reported speech",
            ["direct speech", "quotation speech", "speech report"],
            "Shift pronouns, tense, and time expressions correctly between forms.",
            "Remove quotation marks in reported speech.",
            "Adjust deictic words like now, today, and tomorrow.",
            "Students copy words without viewpoint changes.",
            ["direct speech", "reported speech", "shift"]
          ),
          subskill(
            "synth_active_passive",
            "active <-> passive",
            "passive voice",
            ["active voice", "future passive", "verb voice"],
            "Switch voice while preserving tense and meaning.",
            "Object in active often becomes subject in passive.",
            "Use correct be-form plus past participle.",
            "Students keep active verb forms inside passive structure.",
            ["active passive", "voice", "transformation"]
          )
        ]
      }
    ]
  },
  {
    id: "editing",
    title: "Editing (punctuation, spelling, word form)",
    topics: [
      {
        id: "punctuation",
        title: "Punctuation",
        subskills: [
          subskill(
            "edit_end_marks",
            "End marks",
            "question mark",
            ["comma", "semicolon", "apostrophe"],
            "Use full stop, question mark, and exclamation mark according to sentence purpose.",
            "Ask whether the sentence states, asks, or exclaims.",
            "One complete sentence should end with one clear end mark.",
            "Students use full stop for direct questions.",
            ["end mark", "question mark", "punctuation"]
          ),
          subskill(
            "edit_commas",
            "Commas",
            "comma",
            ["full stop", "semicolon", "no punctuation"],
            "Use commas where sentence structure requires a pause boundary.",
            "Commas often follow fronted phrases and separate list items.",
            "Do not use comma to join two full sentences alone.",
            "Students add random commas based on breathing.",
            ["comma", "list", "fronted phrase"]
          ),
          subskill(
            "edit_apostrophes",
            "Apostrophes",
            "apostrophe",
            ["comma", "quotation mark", "hyphen"],
            "Use apostrophes for possession and contractions correctly.",
            "Check if the noun owns something or if words are contracted.",
            "Do not use apostrophes for regular plural forms.",
            "Students use apostrophes for all words ending in s.",
            ["apostrophe", "possession", "contraction"]
          ),
          subskill(
            "edit_quotes",
            "Quotation marks",
            "quotation marks",
            ["brackets", "apostrophes", "colon"],
            "Use quotation marks to enclose exact spoken words.",
            "Keep punctuation placement consistent with speech tags.",
            "Capitalize the first word inside direct speech when needed.",
            "Students forget closing quotation marks.",
            ["quotation", "direct speech", "punctuation"]
          ),
          subskill(
            "edit_capitalisation",
            "Capitalisation",
            "capital letter",
            ["small letter", "bold letter", "italic letter"],
            "Use capital letters for sentence starts, names, and proper nouns.",
            "Check sentence beginnings and named entities first.",
            "Days, months, and language names usually need capitals.",
            "Students miss capitals in proper nouns.",
            ["capitalisation", "proper noun", "editing"]
          ),
          subskill(
            "edit_its_its_error",
            "Common error: its/it's",
            "it's",
            ["its", "it is'", "its'"],
            "It's means it is; its is a possessive determiner.",
            "Expand it's to it is to test quickly.",
            "If expansion fails, choose its.",
            "Students pick by apostrophe habit, not meaning.",
            ["its", "it's", "common error"]
          ),
          subskill(
            "edit_comma_misuse",
            "Common error: comma misuse",
            "comma",
            ["semicolon", "dash", "no punctuation"],
            "Place commas where structure needs them, not at random pauses.",
            "Check if comma joins two full clauses incorrectly.",
            "Use conjunction or full stop to repair comma splices.",
            "Students insert commas between subject and verb.",
            ["comma misuse", "editing", "repair"]
          )
        ]
      },
      {
        id: "spelling_word_forms",
        title: "Spelling and word forms",
        subskills: [
          subskill(
            "spell_confusables",
            "Confusables",
            "accept",
            ["except", "expect", "access"],
            "Choose the correct word by meaning and sentence context.",
            "Read one phrase before and after the blank.",
            "Confusable words often differ in meaning, not spelling alone.",
            "Students choose by sound similarity.",
            ["confusable", "meaning", "spelling"]
          ),
          subskill(
            "spell_ed_rules",
            "-ed spelling rules",
            "stopped",
            ["stoped", "stopt", "stopping"],
            "Apply -ed endings with correct doubling and spelling changes.",
            "Short vowel + consonant often doubles final consonant.",
            "Verbs ending in e usually add only d.",
            "Students forget consonant doubling rules.",
            ["-ed", "doubling", "past tense spelling"]
          ),
          subskill(
            "spell_plural_rules",
            "Plural spelling rules",
            "knives",
            ["knifes", "knivies", "knife"],
            "Apply regular and irregular plural spelling patterns.",
            "Words ending in f/fe may change to ves.",
            "Not every noun follows regular -s pattern.",
            "Students overgeneralise one plural rule.",
            ["plural spelling", "ves", "irregular"]
          ),
          subskill(
            "spell_comparatives",
            "Comparative spelling",
            "happier",
            ["happyer", "more happy", "happiest"],
            "Form comparatives with correct spelling changes.",
            "Words ending in y often change y to i before -er.",
            "Use one comparative system at a time.",
            "Students keep y and add -er directly.",
            ["comparative spelling", "-er", "word form"]
          ),
          subskill(
            "spell_their_there_theyre",
            "Common error: their/there/they're",
            "their",
            ["there", "they're", "theirs"],
            "Choose between possessive, location, and contraction forms by meaning.",
            "Their = possession, there = place, they're = they are.",
            "Expand they're to test quickly.",
            "Students choose by pronunciation only.",
            ["their there they're", "confusable", "error"]
          ),
          subskill(
            "spell_doubling_rules",
            "Common error: doubling rules",
            "beginning",
            ["begining", "beggining", "beganing"],
            "Double consonants correctly when adding suffixes.",
            "Short stressed vowel often triggers doubling.",
            "Check base word stress before adding endings.",
            "Students double too many letters or too few.",
            ["doubling", "suffix", "spelling rule"]
          )
        ]
      }
    ]
  },
  {
    id: "phrasal_verbs",
    title: "Phrasal verbs",
    topics: [
      {
        id: "form_rules",
        title: "Form rules",
        subskills: [
          subskill(
            "phrasal_transitive_intransitive",
            "Transitive and intransitive phrasal verbs",
            "look up",
            ["look", "look into up", "looked up to"],
            "Some phrasal verbs need an object, while others do not.",
            "Check if the verb needs something after it.",
            "Context usually shows whether an object is required.",
            "Students omit required objects.",
            ["transitive", "intransitive", "phrasal verb"]
          ),
          subskill(
            "phrasal_separable_inseparable",
            "Separable and inseparable phrasal verbs",
            "turn off",
            ["turn the off", "off turn", "turning off the"],
            "Some phrasal verbs can split; others must stay together.",
            "Learn each phrasal verb with its split behavior.",
            "Pronouns often force separation in separable verbs.",
            "Students split inseparable phrasal verbs.",
            ["separable", "inseparable", "particle position"]
          ),
          subskill(
            "phrasal_pronoun_placement",
            "Pronoun placement",
            "put it on",
            ["put on it", "put it up", "put on"],
            "In separable phrasal verbs, pronouns often go between verb and particle.",
            "Use put it on, not put on it.",
            "Check if the object is a pronoun or noun phrase.",
            "Students place pronouns after the particle.",
            ["pronoun placement", "phrasal", "separable"]
          ),
          subskill(
            "phrasal_put_on_it_error",
            "Common error: put on it",
            "put it on",
            ["put on it", "puted it on", "put it in"],
            "Use correct pronoun placement with separable phrasal verbs.",
            "Pronoun usually sits in the middle for separable forms.",
            "Memorise common repair pair: put on it -> put it on.",
            "Students keep noun order when switching to pronouns.",
            ["put it on", "error correction", "phrasal"]
          ),
          subskill(
            "phrasal_look_the_baby_after_error",
            "Common error: look the baby after",
            "look after the baby",
            ["look the baby after", "look after to the baby", "look baby after"],
            "Inseparable phrasal verbs keep verb and particle together.",
            "Look after is inseparable.",
            "Do not place object between look and after.",
            "Students split inseparable combinations.",
            ["look after", "inseparable", "error"]
          )
        ]
      },
      {
        id: "meaning_context",
        title: "Meaning in context",
        subskills: [
          subskill(
            "phrasal_particle_changes_meaning",
            "Particle changes meaning",
            "take off",
            ["take on", "take in", "take down"],
            "Different particles can change the meaning of the same base verb.",
            "Learn verb + particle as one unit.",
            "Check context to choose the correct particle meaning.",
            "Students interpret only the base verb.",
            ["particle meaning", "phrasal semantics", "context"]
          ),
          subskill(
            "phrasal_literal_vs_idiomatic",
            "Literal vs idiomatic meaning",
            "break down",
            ["break up", "break off", "break over"],
            "Phrasal verbs can be literal or idiomatic depending on context.",
            "Read surrounding clues to choose meaning.",
            "Do not assume literal meaning in all cases.",
            "Students choose physical meaning for idiomatic uses.",
            ["literal", "idiomatic", "context meaning"]
          ),
          subskill(
            "phrasal_wrong_particle_choice",
            "Common error: wrong particle choice",
            "fill in",
            ["fill on", "fill up in", "fill at"],
            "Pick the particle that matches standard collocation and context.",
            "Forms and meaning must both match.",
            "Memorise frequent classroom phrasal verbs.",
            "Students choose a particle that sounds similar.",
            ["particle choice", "collocation", "error"]
          ),
          subskill(
            "phrasal_wrong_meaning_context",
            "Common error: wrong meaning from context",
            "run into",
            ["run out", "run over", "run up"],
            "Choose the phrasal verb meaning that fits sentence context.",
            "One phrasal verb can have multiple meanings.",
            "Use nearby nouns and situation clues.",
            "Students know the phrase but choose wrong sense.",
            ["context meaning", "polysemy", "phrasal verb"]
          )
        ]
      },
      {
        id: "high_yield_sets",
        title: "High-yield sets",
        subskills: [
          subskill(
            "phrasal_daily_actions_set",
            "Daily actions set",
            "wake up",
            ["wake on", "wake out", "wake over"],
            "Use common daily-action phrasal verbs accurately in routine contexts.",
            "Daily routines are high-frequency exam contexts.",
            "Practise with time clues and habit sentences.",
            "Students swap particles in familiar routines.",
            ["daily actions", "wake up", "frequency"]
          ),
          subskill(
            "phrasal_school_set",
            "School set",
            "hand in",
            ["hand on", "hand up in", "hand out in"],
            "Apply school-related phrasal verbs used in instructions and tasks.",
            "Hand in means submit; hand out means distribute.",
            "Read role and direction clues.",
            "Students confuse opposite classroom actions.",
            ["school context", "hand in", "instructions"]
          ),
          subskill(
            "phrasal_people_set",
            "People set",
            "get along with",
            ["get along to", "get with along", "get over with"],
            "Use people-related phrasal verbs for relationships and interaction.",
            "Notice preposition and particle combinations.",
            "Use social context clues to pick meaning.",
            "Students shorten the phrase and lose meaning.",
            ["people", "relationship", "phrasal"]
          ),
          subskill(
            "phrasal_movement_set",
            "Movement set",
            "set off",
            ["set on", "set out off", "set from"],
            "Choose movement phrasal verbs by journey direction and start point.",
            "Set off means start a journey.",
            "Check whether context is starting, arriving, or passing.",
            "Students mix movement verbs with result verbs.",
            ["movement", "set off", "journey"]
          ),
          subskill(
            "phrasal_change_outcome_set",
            "Change/outcome set",
            "carry out",
            ["carry on out", "carry over out", "carry into"],
            "Use outcome-focused phrasal verbs in task completion contexts.",
            "Carry out means perform or execute.",
            "Task nouns often signal this phrase.",
            "Students choose continue meaning instead of execute meaning.",
            ["outcome", "carry out", "task"]
          ),
          subskill(
            "phrasal_look_set",
            "Look-set",
            "look after",
            ["look over", "look about", "look in"],
            "Different look phrasal verbs have different meanings.",
            "Learn each look + particle combination separately.",
            "Context decides whether meaning is care, search, or investigate.",
            "Students treat all look phrases as the same.",
            ["look-set", "look after", "particle meaning"]
          )
        ]
      },
      {
        id: "mastery_criteria",
        title: "Mastery criteria",
        subskills: [
          subskill(
            "phrasal_mastery_cloze_selection",
            "Mastery: cloze selection",
            "pick out",
            ["pick in", "pick over", "pick around"],
            "Select correct phrasal verbs in cloze by form and meaning.",
            "Check both grammar fit and context meaning.",
            "Eliminate options with wrong particles first.",
            "Students focus on one clue and ignore the other.",
            ["cloze", "selection", "mastery"]
          ),
          subskill(
            "phrasal_mastery_editing_correction",
            "Mastery: editing correction",
            "cross out",
            ["cross off out", "cross in", "cross over out"],
            "Correct phrasal verb errors in editing passages.",
            "Identify form error first, then meaning mismatch.",
            "Rewrite the full sentence to test correctness.",
            "Students fix spelling but keep wrong particle.",
            ["editing", "correction", "mastery"]
          ),
          subskill(
            "phrasal_mastery_correct_use_writing",
            "Mastery: correct use in writing",
            "bring up",
            ["bring on up", "bring in up", "bring out up"],
            "Use phrasal verbs naturally and correctly in short writing.",
            "Choose phrasal verbs that match tone and meaning.",
            "Keep sentence structure simple and accurate.",
            "Students force advanced phrases in wrong contexts.",
            ["writing", "application", "mastery"]
          )
        ]
      }
    ]
  }
];

const VOCAB = [
  { word: "meticulous", meaning: "very careful" },
  { word: "resilient", meaning: "able to recover quickly" },
  { word: "diligent", meaning: "hardworking and careful" },
  { word: "pragmatic", meaning: "practical and realistic" },
  { word: "cohesive", meaning: "working well together" },
  { word: "lucid", meaning: "clear and easy to understand" },
  { word: "vivid", meaning: "full of clear details" },
  { word: "concise", meaning: "short but complete" },
  { word: "empathetic", meaning: "able to understand feelings" },
  { word: "methodical", meaning: "done in ordered steps" },
  { word: "versatile", meaning: "able to do many things" },
  { word: "robust", meaning: "strong and reliable" },
  { word: "subtle", meaning: "small but important" },
  { word: "candid", meaning: "honest and direct" },
  { word: "frugal", meaning: "careful with money" },
  { word: "vigilant", meaning: "watchful and alert" },
  { word: "courteous", meaning: "polite and respectful" },
  { word: "apt", meaning: "suitable and appropriate" },
  { word: "precise", meaning: "very exact" },
  { word: "insightful", meaning: "showing clear understanding" },
  { word: "ardent", meaning: "very enthusiastic" },
  { word: "steady", meaning: "firm and regular" },
  { word: "graceful", meaning: "smooth and elegant" },
  { word: "credible", meaning: "believable and trustworthy" },
  { word: "fierce", meaning: "strong and intense" },
  { word: "cordial", meaning: "warm and friendly" },
  { word: "humble", meaning: "modest and not proud" },
  { word: "astute", meaning: "quick to understand" },
  { word: "poised", meaning: "calm and controlled" },
  { word: "tenacious", meaning: "not giving up easily" },
  { word: "tranquil", meaning: "calm and peaceful" },
  { word: "dynamic", meaning: "full of energy and change" },
  { word: "adaptable", meaning: "able to adjust easily" },
  { word: "brisk", meaning: "quick and energetic" },
  { word: "inventive", meaning: "good at creating new ideas" },
  { word: "judicious", meaning: "showing good judgement" },
  { word: "disciplined", meaning: "well controlled" },
  { word: "attentive", meaning: "paying close attention" },
  { word: "resourceful", meaning: "good at solving problems" },
  { word: "cooperative", meaning: "ready to work with others" }
];

const NAMES = [
  "Aidan", "Beatrice", "Caleb", "Daphne", "Ethan", "Farah", "Gavin", "Hannah", "Isaac", "Jia", "Kiran", "Lina", "Marcus", "Nadia", "Owen", "Priya", "Qian", "Ravi", "Siti", "Theo", "Uma", "Vera", "Wen", "Xavier", "Yara", "Zane", "Alicia", "Brandon", "Celeste", "Daniel", "Elena", "Fiona", "Harish", "Ivy", "Jonah", "Kayla", "Leon", "Mira", "Noah", "Olivia"
];

const FALLBACK_WRONGS = [
  "incorrect form",
  "wrong structure",
  "incorrect phrase",
  "wrong collocation",
  "incorrect grammar"
];

const EXAMPLE_SENTENCE_BANK = [
  "Before the lesson ended, {NAME}, who was {VOCAB_INLINE}, wrote {FOCUS_STRONG} in the final sentence and explained the grammar reason clearly at checkpoint {CHECKPOINT}.",
  "During revision, {NAME} stayed {VOCAB_INLINE}, used {FOCUS_STRONG} correctly, and then checked the full sentence for meaning at checkpoint {CHECKPOINT}.",
  "In class, {NAME} was {VOCAB_INLINE}; after rereading the line, {NAME} chose {FOCUS_STRONG} and improved the sentence at checkpoint {CHECKPOINT}.",
  "At grammar practice, {NAME} remained {VOCAB_INLINE} and placed {FOCUS_STRONG} correctly so the sentence stayed accurate at checkpoint {CHECKPOINT}.",
  "While reviewing mistakes, {NAME}, a {VOCAB_INLINE} pupil, replaced the wrong word with {FOCUS_STRONG} and repaired the sentence at checkpoint {CHECKPOINT}.",
  "After peer feedback, {NAME} acted {VOCAB_INLINE}, selected {FOCUS_STRONG}, and made the sentence precise for checkpoint {CHECKPOINT}.",
  "In the workbook, {NAME} looked {VOCAB_INLINE} while using {FOCUS_STRONG}; the completed sentence sounded natural at checkpoint {CHECKPOINT}.",
  "During timed practice, {NAME} remained {VOCAB_INLINE}, inserted {FOCUS_STRONG}, and kept the grammar pattern correct at checkpoint {CHECKPOINT}.",
  "When the class compared answers, {NAME} was {VOCAB_INLINE} and showed why {FOCUS_STRONG} was the best choice at checkpoint {CHECKPOINT}.",
  "At the correction station, {NAME}, who was {VOCAB_INLINE}, rewrote the line with {FOCUS_STRONG} and removed the grammar error at checkpoint {CHECKPOINT}.",
  "For homework review, {NAME} was {VOCAB_INLINE}; {NAME} chose {FOCUS_STRONG} so the sentence matched the target rule at checkpoint {CHECKPOINT}.",
  "During language period, {NAME} stayed {VOCAB_INLINE}, used {FOCUS_STRONG}, and explained the clue that proved the answer at checkpoint {CHECKPOINT}."
];

const QUESTION_SENTENCE_BANK = [
  "{NAME}, who was {VOCAB_INLINE}, checked the line and chose {TARGET} so the grammar rule stayed correct in checkpoint {CHECKPOINT}.",
  "After reading the full sentence, {NAME}, a {VOCAB_INLINE} pupil, selected {TARGET} because it matched the grammar clue in checkpoint {CHECKPOINT}.",
  "During revision, {NAME} remained {VOCAB_INLINE} and inserted {TARGET} to complete the sentence accurately in checkpoint {CHECKPOINT}.",
  "At the correction desk, {NAME} was {VOCAB_INLINE}; {NAME} replaced the error with {TARGET} to fix the sentence in checkpoint {CHECKPOINT}.",
  "In this exercise, {NAME}, who stayed {VOCAB_INLINE}, used {TARGET} to keep the sentence meaning clear in checkpoint {CHECKPOINT}.",
  "Before submitting, {NAME} acted {VOCAB_INLINE} and chose {TARGET} because the sentence needed that form in checkpoint {CHECKPOINT}.",
  "While checking options, {NAME}, a {VOCAB_INLINE} learner, picked {TARGET} to satisfy the grammar pattern in checkpoint {CHECKPOINT}.",
  "In guided practice, {NAME} remained {VOCAB_INLINE}; after rereading the line, {NAME} used {TARGET} in checkpoint {CHECKPOINT}.",
  "During exam drill, {NAME}, who was {VOCAB_INLINE}, selected {TARGET} so the sentence stayed grammatical in checkpoint {CHECKPOINT}.",
  "For this item, {NAME} was {VOCAB_INLINE} and wrote {TARGET} after noticing the key clue in checkpoint {CHECKPOINT}.",
  "After eliminating wrong options, {NAME}, a {VOCAB_INLINE} pupil, chose {TARGET} to complete the sentence in checkpoint {CHECKPOINT}.",
  "At the final check, {NAME} stayed {VOCAB_INLINE} and confirmed that {TARGET} was the correct fit in checkpoint {CHECKPOINT}."
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick(list, seed) {
  const index = Math.abs(seed) % list.length;
  return list[index];
}

function seededShuffle(values, seed) {
  const list = values.slice();
  let s = seed >>> 0;
  for (let i = list.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function pad(num) {
  return String(num).padStart(3, "0");
}

function buildContext(subskillId, index) {
  const seed = hashString(subskillId);
  const vocab = VOCAB[(seed * 7 + index * 3) % VOCAB.length];
  return {
    name: NAMES[(seed + index) % NAMES.length],
    vocab,
    checkpoint: index + 1
  };
}

function buildExampleItem(subskill, index) {
  const ctx = buildContext(subskill.id, index);
  const template = EXAMPLE_SENTENCE_BANK[(hashString(subskill.id) + index) % EXAMPLE_SENTENCE_BANK.length];
  const sentenceHtml = renderTemplate(template, {
    NAME: ctx.name,
    VOCAB_INLINE: vocabInline(ctx.vocab),
    FOCUS_STRONG: `<strong>${escapeHtml(subskill.focus)}</strong>`,
    CHECKPOINT: String(ctx.checkpoint)
  });

  return {
    id: `${subskill.id}-ex-${pad(index + 1)}`,
    sentence_html: sentenceHtml,
    focus: subskill.focus,
    vocab: ctx.vocab.word,
    vocab_context_hint: `${ctx.vocab.word} means ${ctx.vocab.meaning}.`,
    micro_tip: `Tip: ${subskill.shortcut}`
  };
}

function pickWrongOptions(subskill, seed) {
  const focusLower = String(subskill.focus).trim().toLowerCase();
  const preferred = seededShuffle(
    (subskill.wrongOptions || []).filter((item) => String(item).trim().toLowerCase() !== focusLower),
    seed
  );
  const fallback = seededShuffle(
    FALLBACK_WRONGS.filter((item) => String(item).trim().toLowerCase() !== focusLower),
    seed + 313
  );

  const unique = [];
  preferred.forEach((item) => {
    if (unique.length < 3 && !unique.includes(item)) {
      unique.push(item);
    }
  });

  fallback.forEach((item) => {
    if (unique.length < 3 && !unique.includes(item)) {
      unique.push(item);
    }
  });

  while (unique.length < 3) {
    unique.push(`wrong-${unique.length + 1}`);
  }

  return unique;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function vocabInline(vocab) {
  return `<span class=\"vocab-inline\"><span class=\"vocab-meaning\">${escapeHtml(vocab.meaning)}</span><span class=\"vocab-word\">${escapeHtml(vocab.word)}</span></span>`;
}

function renderTemplate(template, map) {
  return template.replace(/\{([A-Z_]+)\}/g, function (_, key) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      return map[key];
    }
    return "";
  });
}

function makeStem(format, subskill, ctx, wrongForEditing, index) {
  const template = QUESTION_SENTENCE_BANK[(hashString(subskill.id + ":" + format) + index) % QUESTION_SENTENCE_BANK.length];
  const target = format === "editing_spelling_grammar" ? `[${escapeHtml(wrongForEditing)}]` : "___";
  const body = renderTemplate(template, {
    NAME: ctx.name,
    VOCAB_INLINE: vocabInline(ctx.vocab),
    TARGET: target,
    CHECKPOINT: String(ctx.checkpoint)
  });

  if (format === "multiple_choice_grammar") {
    return `Choose the best option to complete the sentence: ${body}`;
  }
  if (format === "grammar_cloze") {
    return `Grammar cloze. Choose the best answer for the blank: ${body}`;
  }
  if (format === "editing_spelling_grammar") {
    return `Editing task. The bracketed part is wrong; choose the best correction: ${body}`;
  }
  if (format === "synthesis_transformation") {
    return `Synthesis task. Keep the meaning and choose the best completion: ${body}`;
  }
  return `Short writing application. Choose the best option to complete the sentence: ${body}`;
}

function makeResolvedSentence(format, subskill, ctx, index) {
  const template = QUESTION_SENTENCE_BANK[(hashString(subskill.id + ":" + format) + index) % QUESTION_SENTENCE_BANK.length];
  const focusStrong = `<strong>${escapeHtml(subskill.focus)}</strong>`;
  return renderTemplate(template, {
    NAME: ctx.name,
    VOCAB_INLINE: vocabInline(ctx.vocab),
    TARGET: focusStrong,
    CHECKPOINT: String(ctx.checkpoint)
  });
}

function buildOptions(subskill, seed) {
  const wrongs = pickWrongOptions(subskill, seed);
  const values = seededShuffle([subskill.focus].concat(wrongs), seed + 97);
  const ids = ["A", "B", "C", "D"];

  return values.map((value, index) => {
    const isCorrect = value === subskill.focus;
    const feedback = isCorrect
      ? `Correct. ${subskill.rule}`
      : `Not correct. ${value} does not fit this rule: ${subskill.rule}`;
    return {
      id: ids[index],
      text: value,
      is_correct: isCorrect,
      feedback
    };
  });
}

function buildQuestionItem(subskill, format, index) {
  const seed = hashString(`${subskill.id}:${format}:${index}`);
  const ctx = buildContext(`${subskill.id}:${format}`, index);
  const wrongForEditing = pickWrongOptions(subskill, seed + 37)[0];
  const options = buildOptions(subskill, seed);
  const strongestWrong = options.find((opt) => !opt.is_correct);

  return {
    id: `${subskill.id}-${format}-q-${pad(index + 1)}`,
    format,
    stem_html: makeStem(format, subskill, ctx, wrongForEditing, index),
    resolved_sentence_html: makeResolvedSentence(format, subskill, ctx, index),
    vocab: ctx.vocab.word,
    options,
    correct_confusion_note: `This can confuse students because "${strongestWrong ? strongestWrong.text : "another option"}" sounds possible. ${subskill.commonConfusion}`,
    memory_tip: subskill.shortcut
  };
}

function writeJson(filePath, value, pretty) {
  const payload = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
  fs.writeFileSync(filePath, payload + "\n", "utf8");
}

function normalizeSentence(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureUniqueExamples(items, subskillId) {
  const seen = new Set();
  for (let i = 0; i < items.length; i += 1) {
    const normalized = normalizeSentence(items[i].sentence_html);
    if (seen.has(normalized)) {
      throw new Error(`Duplicate example detected for ${subskillId} at index ${i}`);
    }
    seen.add(normalized);
  }
}

function ensureUniqueQuestions(items, subskillId, format) {
  const seen = new Set();
  for (let i = 0; i < items.length; i += 1) {
    const normalized = normalizeSentence(items[i].stem_html);
    if (seen.has(normalized)) {
      throw new Error(`Duplicate question stem detected for ${subskillId}/${format} at index ${i}`);
    }
    seen.add(normalized);
  }
}

function buildData() {
  ensureDir(DATA_ROOT);
  ensureDir(SUBSKILLS_ROOT);

  const manifest = {
    app: {
      id: "psle_grammar_super_app",
      title: "PSLE Grammar Super App (Singapore English)",
      version: 1,
      generatedAt: new Date().toISOString(),
      examplesPerSubskill: EXAMPLES_PER_SUBSKILL,
      questionsPerFormat: QUESTIONS_PER_FORMAT
    },
    practiceFormats: PRACTICE_FORMATS,
    modules: [],
    subskillsIndex: {}
  };

  let totalSubskills = 0;

  MODULES.forEach((module) => {
    const moduleRecord = {
      id: module.id,
      title: module.title,
      topics: []
    };

    module.topics.forEach((topic) => {
      const topicRecord = {
        id: topic.id,
        title: topic.title,
        subskills: []
      };

      topic.subskills.forEach((subskillMeta) => {
        totalSubskills += 1;
        const subskillId = subskillMeta.id;
        const subskillDir = path.join(SUBSKILLS_ROOT, subskillId);
        ensureDir(subskillDir);

        const meta = {
          id: subskillId,
          title: subskillMeta.title,
          module: {
            id: module.id,
            title: module.title
          },
          topic: {
            id: topic.id,
            title: topic.title
          },
          focus_word: subskillMeta.focus,
          short_rule: subskillMeta.rule,
          shortcut: subskillMeta.shortcut,
          tip: subskillMeta.tip,
          common_confusion: subskillMeta.commonConfusion,
          keywords: subskillMeta.keywords
        };

        const examples = [];
        for (let i = 0; i < EXAMPLES_PER_SUBSKILL; i += 1) {
          examples.push(buildExampleItem(subskillMeta, i));
        }
        ensureUniqueExamples(examples, subskillId);

        const questionsByFormat = {};
        PRACTICE_FORMATS.forEach((format) => {
          const questions = [];
          for (let i = 0; i < QUESTIONS_PER_FORMAT; i += 1) {
            questions.push(buildQuestionItem(subskillMeta, format, i));
          }
          ensureUniqueQuestions(questions, subskillId, format);
          questionsByFormat[format] = questions;
        });

        const paths = {
          meta: `./data/subskills/${subskillId}/meta.json`,
          examples: `./data/subskills/${subskillId}/examples.json`,
          questions: {}
        };

        PRACTICE_FORMATS.forEach((format) => {
          paths.questions[format] = `./data/subskills/${subskillId}/questions.${format}.json`;
        });

        writeJson(path.join(subskillDir, "meta.json"), meta, true);
        writeJson(path.join(subskillDir, "examples.json"), {
          subskillId,
          count: examples.length,
          items: examples
        }, false);

        PRACTICE_FORMATS.forEach((format) => {
          writeJson(path.join(subskillDir, `questions.${format}.json`), {
            subskillId,
            format,
            count: questionsByFormat[format].length,
            items: questionsByFormat[format]
          }, false);
        });

        const summary = {
          id: subskillId,
          title: subskillMeta.title,
          focus_word: subskillMeta.focus,
          counts: {
            examples: examples.length,
            questions_per_format: QUESTIONS_PER_FORMAT
          },
          paths
        };

        topicRecord.subskills.push(summary);
        manifest.subskillsIndex[subskillId] = {
          id: subskillId,
          title: subskillMeta.title,
          moduleId: module.id,
          topicId: topic.id,
          focus_word: subskillMeta.focus,
          counts: {
            examples: examples.length,
            questions_per_format: QUESTIONS_PER_FORMAT
          },
          paths
        };
      });

      moduleRecord.topics.push(topicRecord);
    });

    manifest.modules.push(moduleRecord);
  });

  manifest.summary = {
    modules: manifest.modules.length,
    topics: manifest.modules.reduce((acc, mod) => acc + mod.topics.length, 0),
    subskills: totalSubskills,
    minimum_examples_total: totalSubskills * EXAMPLES_PER_SUBSKILL,
    minimum_questions_total: totalSubskills * QUESTIONS_PER_FORMAT * PRACTICE_FORMATS.length
  };

  writeJson(path.join(DATA_ROOT, "manifest.json"), manifest, true);

  console.log(`Generated ${totalSubskills} subskills.`);
  console.log(`Examples: ${manifest.summary.minimum_examples_total}`);
  console.log(`Questions: ${manifest.summary.minimum_questions_total}`);
}

buildData();
