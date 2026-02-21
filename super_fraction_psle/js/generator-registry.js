(function () {
  "use strict";

  window.createSuperFractionGeneratorRegistry = function createSuperFractionGeneratorRegistry(deps) {
    var makeMixed = deps.makeMixed;
    var makeImproper = deps.makeImproper;
    var makeProper = deps.makeProper;
    var makeQuestion = deps.makeQuestion;
    var makeChoiceSet = deps.makeChoiceSet;
    var formatFrac = deps.formatFrac;
    var frac = deps.frac;
    var addFrac = deps.addFrac;
    var subFrac = deps.subFrac;
    var mulFrac = deps.mulFrac;
    var divFrac = deps.divFrac;
    var cmpFrac = deps.cmpFrac;
    var equalFrac = deps.equalFrac;
    var gcd = deps.gcd;
    var lcm = deps.lcm;
    var randInt = deps.randInt;
    var shuffle = deps.shuffle;
    var fractionValue = deps.fractionValue;

  function genS1Forms(s, difficulty) {
    if (Math.random() < 0.5) {
      var mixed = makeMixed(Math.max(7, s.maxDen), s.maxWhole);
      return makeQuestion("s1_forms", difficulty, {
        prompt: "Convert " + mixed.whole + " " + formatFrac(mixed.proper, false) + " to an improper fraction in lowest terms.",
        answer: mixed.fraction,
        answerMode: "fraction_simplest",
        methodsA: [
          "Multiply whole by denominator: " + mixed.whole + " x " + mixed.proper.d + ".",
          "Add numerator: " + (mixed.whole * mixed.proper.d) + " + " + mixed.proper.n + " = " + mixed.fraction.n + ".",
          "Keep denominator " + mixed.proper.d + " and simplify if needed."
        ],
        methodsB: [
          "Rewrite whole as " + (mixed.whole * mixed.proper.d) + "/" + mixed.proper.d + ".",
          "Add the proper fraction to form one denominator.",
          "Equivalent names represent same value."
        ],
        methodsC: [
          "Memory line: whole x bottom + top, over bottom.",
          "Quick estimate: answer should be more than " + mixed.whole + ".",
          "If result < whole, you likely made an arithmetic error."
        ],
        shortcut: "whole x denominator + numerator, over denominator.",
        pitfall: "Adding denominator into numerator twice.",
        whyItWorks: "Each whole equals denominator/denominator, so conversion just counts total denominator-parts.",
        checks: "Convert your answer back to mixed form to verify equivalence."
      });
    }

    var improper = makeImproper(Math.max(7, s.maxDen));
    return makeQuestion("s1_forms", difficulty, {
      prompt: "Convert " + formatFrac(improper, false) + " to a mixed number in simplest form.",
      answer: improper,
      answerMode: "fraction_simplest",
      preferMixed: true,
      methodsA: [
        "Divide numerator by denominator.",
        "Quotient is whole part; remainder becomes numerator.",
        "Write remainder/denominator and simplify if needed."
      ],
      methodsB: [
        "Group denominator-sized bundles from numerator.",
        "Each full bundle gives 1 whole.",
        "Leftover parts become the fractional part."
      ],
      methodsC: [
        "Use nearest multiple of denominator below numerator.",
        "Difference is remainder.",
        "This mental split is fast for exam speed."
      ],
      shortcut: "Mixed form = quotient remainder/denominator.",
      pitfall: "Putting quotient as denominator.",
      whyItWorks: "Improper fractions count parts beyond one whole; division separates wholes from leftover parts.",
      checks: "Convert back to improper: should return original fraction."
    });
  }

  function genS1Equivalent(s, difficulty) {
    var base = makeProper(Math.max(6, s.maxDen - 2));
    var factor = randInt(2, 8);
    var rawN = base.n * factor;
    var rawD = base.d * factor;

    return makeQuestion("s1_equivalent", difficulty, {
      prompt: "Simplify " + rawN + "/" + rawD + " to lowest terms.",
      answer: base,
      answerMode: "fraction_simplest",
      methodsA: [
        "Find GCD(" + rawN + ", " + rawD + ") = " + gcd(rawN, rawD) + ".",
        "Divide numerator and denominator by GCD.",
        "Final simplest fraction is " + formatFrac(base, false) + "."
      ],
      methodsB: [
        "Factor both numerator and denominator.",
        "Cancel shared factors pair by pair.",
        "Stop when no common factor remains."
      ],
      methodsC: [
        "Check divisibility by 2, 3, 5 quickly first.",
        "Repeated small cancellations are exam-safe.",
        "Confirm final numerator and denominator are coprime."
      ],
      shortcut: "If both are even, divide by 2 immediately.",
      pitfall: "Changing only one part of the fraction.",
      whyItWorks: "Dividing top and bottom by the same non-zero factor preserves fraction value.",
      checks: "Re-expand simplified form by factor " + factor + " to confirm original."
    });
  }

  function genS1NumberLine(s, difficulty) {
    var denominator = randInt(4, Math.max(8, s.maxDen));
    var numerator = randInt(1, denominator - 1);
    var answer = frac(numerator, denominator);

    return makeQuestion("s1_numberline", difficulty, {
      prompt: "A number line from 0 to 1 is divided into " + denominator + " equal parts. Point P is at the " + numerator + "th tick after 0. Write P as a fraction in simplest form.",
      answer: answer,
      answerMode: "fraction_simplest",
      methodsA: [
        "Denominator is total equal parts: " + denominator + ".",
        "Numerator is selected parts from 0: " + numerator + ".",
        "Write " + numerator + "/" + denominator + " and simplify if needed."
      ],
      methodsB: [
        "Think in unit fractions: each step is 1/" + denominator + ".",
        "After " + numerator + " steps, value is " + numerator + "x1/" + denominator + ".",
        "So P = " + formatFrac(answer, false) + "."
      ],
      methodsC: [
        "Benchmark check: P is between 0 and 1.",
        "If numerator > denominator, it cannot be inside 0 to 1 interval.",
        "Use this to catch numerator-denominator swaps."
      ],
      shortcut: "On unit number lines: tick count = numerator, total partitions = denominator.",
      pitfall: "Reversing numerator and denominator.",
      whyItWorks: "Number line partitions represent equal-sized units; fraction counts how many of those units from zero.",
      checks: "Approximate decimal should match position on the line."
    });
  }

  function genS2Compare(s, difficulty) {
    var a = makeProper(Math.max(8, s.maxDen));
    var b = makeProper(Math.max(8, s.maxDen));

    while (equalFrac(a, b)) {
      b = makeProper(Math.max(8, s.maxDen));
    }

    var cmp = cmpFrac(a, b);
    var correct = cmp > 0
      ? formatFrac(a, false) + " > " + formatFrac(b, false)
      : formatFrac(a, false) + " < " + formatFrac(b, false);

    var choiceSet = makeChoiceSet(correct, [
      formatFrac(a, false) + " = " + formatFrac(b, false),
      cmp > 0
        ? formatFrac(a, false) + " < " + formatFrac(b, false)
        : formatFrac(a, false) + " > " + formatFrac(b, false),
      "Cannot be determined"
    ]);

    return makeQuestion("s2_compare", difficulty, {
      prompt: "Choose the correct comparison.",
      answer: choiceSet.answerId,
      answerMode: "choice",
      choices: choiceSet.choices,
      methodsA: [
        "Use cross-products: compare " + (a.n * b.d) + " and " + (b.n * a.d) + ".",
        "Bigger cross-product means bigger fraction.",
        "Select the matching inequality."
      ],
      methodsB: [
        "Find common denominator LCM(" + a.d + ", " + b.d + ").",
        "Convert both to that denominator.",
        "Compare adjusted numerators."
      ],
      methodsC: [
        "Benchmark each fraction against 1/2 first.",
        "If both near each other, then use cross-products.",
        "This two-stage approach balances speed and certainty."
      ],
      shortcut: "Cross-products are usually fastest in MCQ comparison.",
      pitfall: "Assuming bigger denominator means bigger fraction.",
      whyItWorks: "Cross-multiplication compares equivalent numerators over common denominator bd.",
      checks: "Confirm sign by estimating decimal values mentally."
    });
  }

  function genS2Order(s, difficulty) {
    var values = [];
    while (values.length < 3) {
      var f = makeProper(Math.max(8, s.maxDen));
      var key = formatFrac(f, false);
      var seen = values.some(function (entry) { return formatFrac(entry.f, false) === key; });
      if (!seen) {
        values.push({ id: String.fromCharCode(65 + values.length), f: f });
      }
    }

    var sorted = values.slice().sort(function (x, y) {
      return cmpFrac(x.f, y.f);
    });

    var correctOrder = sorted.map(function (entry) { return entry.id; }).join(" < ");
    var all = [
      "A < B < C",
      "A < C < B",
      "B < A < C",
      "B < C < A",
      "C < A < B",
      "C < B < A"
    ];

    var wrong = all.filter(function (item) {
      return item !== correctOrder;
    });

    shuffle(wrong);

    var choiceSet = makeChoiceSet(correctOrder, [wrong[0], wrong[1], wrong[2]]);

    return makeQuestion("s2_order", difficulty, {
      prompt: "Arrange in ascending order.\nA = " + formatFrac(values[0].f, false) + ", B = " + formatFrac(values[1].f, false) + ", C = " + formatFrac(values[2].f, false),
      answer: choiceSet.answerId,
      answerMode: "choice",
      choices: choiceSet.choices,
      methodsA: [
        "Convert all fractions to a common denominator.",
        "Sort by numerators from smallest to largest.",
        "Translate the sorted fractions back into A/B/C order."
      ],
      methodsB: [
        "Use pairwise cross-product comparisons.",
        "Build full order from pairwise outcomes.",
        "Check transitivity (if A<B and B<C then A<C)."
      ],
      methodsC: [
        "Do benchmark elimination first (near 1/2 or 1).",
        "Eliminate impossible option patterns quickly.",
        "Confirm final candidate with exact method."
      ],
      shortcut: "Quick benchmark pass reduces MCQ options before exact work.",
      pitfall: "Ordering by numerator without matching denominators.",
      whyItWorks: "Ordering needs a shared scale; common denominator or cross-products provide that scale.",
      checks: "Verify smallest and largest first before deciding middle term."
    });
  }

  function genS3AddUnlike(s, difficulty) {
    var a = makeProper(Math.max(8, s.maxDen));
    var b = makeProper(Math.max(8, s.maxDen));

    while (a.d === b.d) {
      b = makeProper(Math.max(8, s.maxDen));
    }

    var l = lcm(a.d, b.d);
    var ans = addFrac(a, b);

    return makeQuestion("s3_add_unlike", difficulty, {
      prompt: "Compute: " + formatFrac(a, false) + " + " + formatFrac(b, false),
      answer: ans,
      answerMode: "fraction_simplest",
      methodsA: [
        "Find LCM(" + a.d + ", " + b.d + ") = " + l + ".",
        "Rewrite as equivalent fractions with denominator " + l + ".",
        "Add numerators, keep denominator, simplify."
      ],
      methodsB: [
        "Use butterfly form: (ad + cb)/bd.",
        "Compute top and bottom carefully.",
        "Simplify to lowest terms."
      ],
      methodsC: [
        "Estimate each fraction to decimals before adding.",
        "Check exact answer is close to estimate.",
        "Large mismatch means denominator conversion mistake."
      ],
      shortcut: "If one denominator is a multiple of another, use larger denominator.",
      pitfall: "Adding denominators directly.",
      whyItWorks: "Addition requires equal part sizes; equivalent fractions create that common unit size.",
      checks: "Answer should be greater than each addend."
    });
  }

  function genS3SubtractMixed(s, difficulty) {
    var m1 = makeMixed(Math.max(8, s.maxDen), s.maxWhole + 1);
    var m2 = makeMixed(Math.max(8, s.maxDen), s.maxWhole);

    if (cmpFrac(m1.fraction, m2.fraction) < 0) {
      var tmp = m1;
      m1 = m2;
      m2 = tmp;
    }

    var ans = subFrac(m1.fraction, m2.fraction);

    return makeQuestion("s3_subtract_mixed", difficulty, {
      prompt: "Compute: " + m1.whole + " " + formatFrac(m1.proper, false) + " - " + m2.whole + " " + formatFrac(m2.proper, false),
      answer: ans,
      answerMode: "fraction_simplest",
      preferMixed: true,
      methodsA: [
        "Convert both mixed numbers to improper fractions.",
        "Subtract using common denominator.",
        "Simplify and express as mixed form if needed."
      ],
      methodsB: [
        "Use borrowing: if first fraction part is smaller, borrow 1 whole.",
        "Convert borrowed whole to denominator parts.",
        "Subtract whole and fraction parts separately."
      ],
      methodsC: [
        "Estimate rough difference using whole numbers first.",
        "Then compute exact fraction difference.",
        "Check final answer is below first mixed number."
      ],
      shortcut: "Borrowing method is often cleaner when first fraction part is smaller.",
      pitfall: "Subtracting fractional parts without regrouping when needed.",
      whyItWorks: "Mixed numbers can be decomposed and regrouped while preserving total value.",
      checks: "Add your answer to the subtrahend; it should recover the minuend."
    });
  }

  function genS4Multiply(s, difficulty) {
    var left = Math.random() < 0.5 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var right = Math.random() < 0.5 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var ans = mulFrac(left, right);

    return makeQuestion("s4_multiply", difficulty, {
      prompt: "Compute: " + formatFrac(left, false) + " x " + formatFrac(right, false),
      answer: ans,
      answerMode: "fraction_simplest",
      methodsA: [
        "Multiply numerators and denominators directly.",
        "Simplify final fraction.",
        "Write in mixed form if required."
      ],
      methodsB: [
        "Cross-cancel common factors first.",
        "Multiply reduced values.",
        "Perform final simplification check."
      ],
      methodsC: [
        "Estimate magnitude before exact multiplication.",
        "If both factors < 1, product must be smaller than each factor.",
        "Use this to detect arithmetic slips."
      ],
      shortcut: "Cross-cancel before multiplying large numbers.",
      pitfall: "Forgetting to simplify.",
      whyItWorks: "Multiplication scales one quantity by another ratio.",
      checks: "Compare answer size against factor sizes for reasonableness."
    });
  }

  function genS4Divide(s, difficulty) {
    var left = Math.random() < 0.5 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var right = makeProper(Math.max(8, s.maxDen));
    while (right.n === 0) {
      right = makeProper(Math.max(8, s.maxDen));
    }

    var ans = divFrac(left, right);

    return makeQuestion("s4_divide", difficulty, {
      prompt: "Compute: " + formatFrac(left, false) + " / " + formatFrac(right, false),
      answer: ans,
      answerMode: "fraction_simplest",
      methodsA: [
        "Keep first fraction, flip second, multiply.",
        "Multiply numerators and denominators.",
        "Simplify to lowest terms."
      ],
      methodsB: [
        "Interpret division as multiplication by reciprocal.",
        "Cross-cancel after flipping.",
        "Then compute simplified product."
      ],
      methodsC: [
        "Estimate divisor size relative to 1.",
        "Dividing by value <1 should increase result.",
        "Mismatch indicates reciprocal mistake."
      ],
      shortcut: "KFC rule: Keep, Flip, Change to multiply.",
      pitfall: "Flipping the first fraction instead of the second.",
      whyItWorks: "Division asks how many divisor units fit in the dividend; reciprocal transforms this into multiplication.",
      checks: "Multiply your answer by divisor to recover dividend."
    });
  }

  function genS5FractionOfQuantity(s, difficulty) {
    var f = makeProper(Math.max(8, s.maxDen));
    var unit = randInt(2, s.maxWhole + 8);
    var quantity = f.d * unit;
    var ans = frac(quantity * f.n, f.d);

    return makeQuestion("s5_fraction_of_quantity", difficulty, {
      prompt: "Find " + formatFrac(f, false) + " of " + quantity + ".",
      answer: ans,
      answerMode: "fraction_simplest",
      methodsA: [
        "Divide quantity by denominator first.",
        "Multiply by numerator.",
        "Write exact value."
      ],
      methodsB: [
        "Use equation: value = quantity x fraction.",
        "Compute and simplify.",
        "Match unit in final answer."
      ],
      methodsC: [
        "Estimate using nearby easy fraction.",
        "Exact answer should be below whole quantity for proper fraction.",
        "Use estimate to check arithmetic."
      ],
      shortcut: "Divide first, multiply second for cleaner numbers.",
      pitfall: "Multiplying by denominator instead of dividing.",
      whyItWorks: "Denominator partitions the whole; numerator selects how many equal parts are taken.",
      checks: "Proper fraction of a quantity must be less than the quantity."
    });
  }

  function genS5WholeFromPart(s, difficulty) {
    var f = makeProper(Math.max(8, s.maxDen));
    var unit = randInt(2, s.maxWhole + 8);
    var whole = f.d * unit;
    var part = whole * f.n / f.d;

    return makeQuestion("s5_whole_from_part", difficulty, {
      prompt: formatFrac(f, false) + " of a number is " + part + ". Find the number.",
      answer: frac(whole, 1),
      answerMode: "fraction_simplest",
      methodsA: [
        f.n + " parts = " + part + ", so 1 part = " + (part / f.n) + ".",
        "Whole has " + f.d + " parts.",
        "Whole = " + (part / f.n) + " x " + f.d + " = " + whole + "."
      ],
      methodsB: [
        "Let whole be x.",
        "(" + formatFrac(f, false) + ")x = " + part + ".",
        "x = " + part + " x " + f.d + "/" + f.n + " = " + whole + "."
      ],
      methodsC: [
        "Reverse operation mindset: from part back to 1 whole.",
        "Scale by denominator/numerator.",
        "Check by substituting into original statement."
      ],
      shortcut: "Unitary method: divide by numerator, multiply by denominator.",
      pitfall: "Treating given part as whole.",
      whyItWorks: "If p/q of whole is known, one unit part can be recovered then scaled to q parts.",
      checks: "Substitute found whole back into fraction statement."
    });
  }

  function genS6BeforeAfter(s, difficulty) {
    var start = makeProper(Math.max(8, s.maxDen));
    var added = makeProper(Math.max(8, s.maxDen));
    var sum = addFrac(start, added);
    var guard = 0;

    while (cmpFrac(sum, frac(1, 1)) > 0 && guard < 20) {
      start = makeProper(Math.max(8, s.maxDen));
      added = makeProper(Math.max(8, s.maxDen));
      sum = addFrac(start, added);
      guard += 1;
    }

    return makeQuestion("s6_before_after", difficulty, {
      prompt: "A tank is " + formatFrac(start, false) + " full. Then " + formatFrac(added, false) + " of the whole tank is added. What fraction of the tank is full now?",
      answer: sum,
      answerMode: "fraction_simplest",
      methodsA: [
        "Both fractions refer to the same whole tank.",
        "Add the two fractions with common denominator.",
        "Simplify final fullness fraction."
      ],
      methodsB: [
        "Draw model bars for start and added amounts.",
        "Combine shaded parts.",
        "Convert combined parts to a single fraction."
      ],
      methodsC: [
        "Quick check: final fullness must be greater than start level.",
        "If above 1, question conditions likely violated.",
        "Then execute exact arithmetic."
      ],
      shortcut: "When both are fractions of the same whole, add directly after denominator alignment.",
      pitfall: "Treating second fraction as fraction of remaining instead of whole.",
      whyItWorks: "Fractions can be combined only when they reference the same whole quantity.",
      checks: "Result should be between start fraction and 1."
    });
  }

  function genS6Remainder(s, difficulty) {
    var used1 = makeProper(Math.max(8, s.maxDen));
    var used2 = makeProper(Math.max(8, s.maxDen));
    var used = addFrac(used1, used2);

    var guard = 0;
    while (cmpFrac(used, frac(1, 1)) >= 0 && guard < 20) {
      used1 = makeProper(Math.max(8, s.maxDen));
      used2 = makeProper(Math.max(8, s.maxDen));
      used = addFrac(used1, used2);
      guard += 1;
    }

    var left = subFrac(frac(1, 1), used);

    return makeQuestion("s6_remainder", difficulty, {
      prompt: "A container has " + formatFrac(used1, false) + " used in the morning and " + formatFrac(used2, false) + " used in the afternoon. What fraction is left?",
      answer: left,
      answerMode: "fraction_simplest",
      methodsA: [
        "Total used fraction = " + formatFrac(used1, false) + " + " + formatFrac(used2, false) + ".",
        "Left fraction = 1 - used fraction.",
        "Simplify final remainder fraction."
      ],
      methodsB: [
        "Compute each used portion in common denominator.",
        "Sum used numerators.",
        "Subtract from full whole denominator."
      ],
      methodsC: [
        "Estimate: if about half used in each stage, little remains.",
        "Use estimate to judge final remainder size.",
        "Then do exact subtraction from 1."
      ],
      shortcut: "Remainder questions often become 1 - (total used fraction).",
      pitfall: "Subtracting one used fraction from the other instead of from 1.",
      whyItWorks: "Whole equals used + remaining, so remaining is complement of total used.",
      checks: "Used fraction + remaining fraction must equal exactly 1."
    });
  }

  function genS6Sequential(s, difficulty) {
    var total = randInt(6, 14) * 6;
    var f1 = makeProper(Math.max(8, s.maxDen));
    var f2 = makeProper(Math.max(8, s.maxDen));
    var f3 = makeProper(Math.max(8, s.maxDen));

    var used = addFrac(addFrac(f1, f2), f3);
    var guard = 0;

    while (cmpFrac(used, frac(1, 1)) >= 0 && guard < 30) {
      f1 = makeProper(Math.max(8, s.maxDen));
      f2 = makeProper(Math.max(8, s.maxDen));
      f3 = makeProper(Math.max(8, s.maxDen));
      used = addFrac(addFrac(f1, f2), f3);
      guard += 1;
    }

    var leftFraction = subFrac(frac(1, 1), used);
    var ans = mulFrac(leftFraction, frac(total, 1));

    return makeQuestion("s6_sequential", difficulty, {
      prompt: "A tank holds " + total + " L. " + formatFrac(f1, false) + " is used first, then " + formatFrac(f2, false) + ", then " + formatFrac(f3, false) + " (all of the whole tank). How many liters are left?",
      answer: ans,
      answerMode: "fraction_simplest",
      methodsA: [
        "Total used fraction = " + formatFrac(f1, false) + " + " + formatFrac(f2, false) + " + " + formatFrac(f3, false) + ".",
        "Remaining fraction = 1 - total used fraction.",
        "Remaining liters = total x remaining fraction."
      ],
      methodsB: [
        "Find liters used in each stage separately.",
        "Add used liters.",
        "Subtract from total liters to get remaining liters."
      ],
      methodsC: [
        "Estimate used fraction before exact calculation.",
        "Use estimate to expect approximate remaining liters.",
        "If exact answer is far off, recheck denominator work."
      ],
      shortcut: "Combine fractions first when all refer to the same whole.",
      pitfall: "Treating later fractions as fractions of remainder when prompt says of whole.",
      whyItWorks: "When each fraction is of the same whole, they can be added before converting to quantity.",
      checks: "Used liters + remaining liters should equal total."
    });
  }

  function genS6SameTotal(s, difficulty) {
    var a = makeProper(Math.max(8, s.maxDen));
    var b = makeProper(Math.max(8, s.maxDen));
    while (equalFrac(a, b)) {
      b = makeProper(Math.max(8, s.maxDen));
    }

    var cmp = cmpFrac(a, b);
    var bigger = cmp > 0 ? "Ali" : "Bo";
    var diff = cmp > 0 ? subFrac(a, b) : subFrac(b, a);

    return makeQuestion("s6_same_total", difficulty, {
      prompt: "Ali and Bo each have identical whole cakes. Ali ate " + formatFrac(a, false) + " of his cake and Bo ate " + formatFrac(b, false) + ". How much more cake did the person who ate more consume?",
      answer: diff,
      answerMode: "fraction_simplest",
      methodsA: [
        "Compare the two fractions first.",
        "Subtract smaller share from larger share.",
        "Write result as fraction of one whole cake."
      ],
      methodsB: [
        "Convert both shares to common denominator.",
        "Find difference of numerators.",
        "Translate back to fraction difference."
      ],
      methodsC: [
        "Identify likely larger share by benchmark (near 1/2 or 1).",
        "Then run exact subtraction.",
        "Name who ate more: " + bigger + "."
      ],
      shortcut: "Same total means direct fraction comparison works.",
      pitfall: "Trying to convert to different wholes when totals are already equal.",
      whyItWorks: "Equal wholes allow direct subtraction of fractional shares.",
      checks: "Difference must be positive and smaller than 1."
    });
  }

  function genS6WordAlgebra(s, difficulty) {
    var xVal = Math.random() < 0.5 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var coeff = makeProper(Math.max(8, s.maxDen));
    var addend = makeProper(Math.max(8, s.maxDen));
    var right = addFrac(mulFrac(coeff, xVal), addend);

    return makeQuestion("s6_word_algebra", difficulty, {
      prompt: "In a puzzle, " + formatFrac(coeff, false) + " of x plus " + formatFrac(addend, false) + " equals " + formatFrac(right, false) + ". Find x.",
      answer: xVal,
      answerMode: "fraction_simplest",
      methodsA: [
        "Subtract " + formatFrac(addend, false) + " from both sides.",
        "Divide by " + formatFrac(coeff, false) + " to isolate x.",
        "Simplify final x value."
      ],
      methodsB: [
        "Clear denominators by multiplying entire equation by LCM.",
        "Solve resulting linear equation.",
        "Convert back to fraction form if needed."
      ],
      methodsC: [
        "Treat as two-step reverse operations.",
        "Undo + first, then divide by the coefficient fraction.",
        "Substitute to verify statement."
      ],
      shortcut: "Undo operations in reverse order of appearance.",
      pitfall: "Dividing by coefficient before removing addend.",
      whyItWorks: "Equivalent operations on both sides preserve equality while isolating x.",
      checks: "Substitute x into original sentence and confirm both sides equal.",
      substitution: "Check: " + formatFrac(coeff, false) + " x x + " + formatFrac(addend, false) + " = " + formatFrac(right, false)
    });
  }

  function algebraLanesInverse(a, addend, right, xVal) {
    return {
      reverse: [
        "Start: x/" + a + " + " + formatFrac(addend, false) + " = " + formatFrac(right, false) + ".",
        "Subtract " + formatFrac(addend, false) + " from both sides.",
        "Now x/" + a + " = " + formatFrac(subFrac(right, addend), false) + ".",
        "Multiply both sides by " + a + ".",
        "x = " + formatFrac(xVal, true) + "."
      ],
      clear: [
        "Find LCM of denominators in equation.",
        "Multiply entire equation by LCM to clear fractions.",
        "Solve resulting linear equation in x.",
        "Convert to simplest fraction form.",
        "x = " + formatFrac(xVal, true) + "."
      ]
    };
  }

  function genS7AlgInverse(s, difficulty) {
    var xVal = Math.random() < 0.55 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var a = randInt(2, Math.min(8, s.maxDen));
    var addend = makeProper(Math.max(8, s.maxDen));
    var right = addFrac(divFrac(xVal, frac(a, 1)), addend);

    return makeQuestion("s7_alg_inverse", difficulty, {
      prompt: "Solve for x:  x/" + a + " + " + formatFrac(addend, false) + " = " + formatFrac(right, false),
      answer: xVal,
      answerMode: "fraction_simplest",
      methodsA: [
        "Subtract the constant fraction first.",
        "Multiply by " + a + " to isolate x.",
        "Simplify x."
      ],
      methodsB: [
        "Clear denominators by multiplying by LCM.",
        "Solve resulting equation.",
        "Convert back to simplest fraction if needed."
      ],
      methodsC: [
        "Reverse-operation chain: + then / by " + a + ".",
        "Undo chain in reverse: subtract first, then multiply by " + a + ".",
        "Substitute to verify."
      ],
      shortcut: "Reverse operations in order: add/subtract first, then multiply/divide constants.",
      pitfall: "Multiplying by " + a + " before removing addend.",
      whyItWorks: "Balanced operations preserve equation truth while isolating x.",
      checks: "Substitute x into original equation.",
      lanes: algebraLanesInverse(a, addend, right, xVal),
      substitution: "x/" + a + " + " + formatFrac(addend, false) + " should become " + formatFrac(right, false)
    });
  }

  function genS7AlgBracket(s, difficulty) {
    var xVal = Math.random() < 0.55 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var p = makeProper(Math.max(8, s.maxDen));
    var a = randInt(2, Math.min(8, s.maxDen));
    var right = divFrac(addFrac(xVal, p), frac(a, 1));

    return makeQuestion("s7_alg_bracket", difficulty, {
      prompt: "Solve for x:  (x + " + formatFrac(p, false) + ")/" + a + " = " + formatFrac(right, false),
      answer: xVal,
      answerMode: "fraction_simplest",
      methodsA: [
        "Multiply both sides by " + a + ".",
        "Subtract " + formatFrac(p, false) + " from both sides.",
        "Simplify x."
      ],
      methodsB: [
        "View expression as two operations on x: +" + formatFrac(p, false) + ", then /" + a + ".",
        "Undo divide first, then undo addition.",
        "Confirm by substitution."
      ],
      methodsC: [
        "Compute " + formatFrac(right, false) + "x" + a + " mentally first.",
        "Then subtract " + formatFrac(p, false) + ".",
        "Keep fractions simplified each step."
      ],
      shortcut: "For (x + p)/a = q, do aq first, then subtract p.",
      pitfall: "Applying division only to x and not to full numerator.",
      whyItWorks: "The bracket is one unit; inverse operations must undo whole-expression operations.",
      checks: "Substitute x and verify bracket equation.",
      lanes: {
        reverse: [
          "Start with (x + " + formatFrac(p, false) + ")/" + a + " = " + formatFrac(right, false) + ".",
          "Multiply both sides by " + a + ".",
          "x + " + formatFrac(p, false) + " = " + formatFrac(mulFrac(right, frac(a, 1)), false) + ".",
          "Subtract " + formatFrac(p, false) + " from both sides.",
          "x = " + formatFrac(xVal, true) + "."
        ],
        clear: [
          "LCM-based method: multiply equation by denominator(s).",
          "Bracket remains intact until multiplication done.",
          "Solve resulting linear equation.",
          "Simplify x to final form.",
          "x = " + formatFrac(xVal, true) + "."
        ]
      },
      substitution: "(x + " + formatFrac(p, false) + ")/" + a + " should equal " + formatFrac(right, false)
    });
  }

  function genS7AlgCoefficient(s, difficulty) {
    var xVal = Math.random() < 0.55 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var coeff = makeProper(Math.max(8, s.maxDen));
    var right = mulFrac(coeff, xVal);

    return makeQuestion("s7_alg_coefficient", difficulty, {
      prompt: "Solve for x:  (" + formatFrac(coeff, false) + ")x = " + formatFrac(right, false),
      answer: xVal,
      answerMode: "fraction_simplest",
      methodsA: [
        "Divide both sides by coefficient " + formatFrac(coeff, false) + ".",
        "This is equivalent to multiplying by reciprocal.",
        "Simplify x."
      ],
      methodsB: [
        "Write x = " + formatFrac(right, false) + " / " + formatFrac(coeff, false) + ".",
        "Flip second fraction and multiply.",
        "Simplify to get x."
      ],
      methodsC: [
        "Estimate coefficient size to anticipate x size.",
        "If coefficient <1, x should be larger than right side.",
        "Use estimate as a reasonableness check."
      ],
      shortcut: "Dividing by a fraction = multiplying by reciprocal.",
      pitfall: "Multiplying by coefficient again instead of dividing.",
      whyItWorks: "Inverse operation of multiplication by coeff is division by coeff.",
      checks: "Substitute x and verify left side equals right side.",
      lanes: {
        reverse: [
          "Start: (" + formatFrac(coeff, false) + ")x = " + formatFrac(right, false) + ".",
          "Divide both sides by " + formatFrac(coeff, false) + ".",
          "x = " + formatFrac(right, false) + " / " + formatFrac(coeff, false) + ".",
          "Flip and multiply.",
          "x = " + formatFrac(xVal, true) + "."
        ],
        clear: [
          "Clear denominators by multiplying equation by LCM.",
          "Solve integer-coefficient linear equation.",
          "Convert back to fraction form.",
          "Reduce final x.",
          "x = " + formatFrac(xVal, true) + "."
        ]
      },
      substitution: "(" + formatFrac(coeff, false) + ")x should equal " + formatFrac(right, false)
    });
  }

  function genS7AlgPlusMinus(s, difficulty) {
    var xVal = Math.random() < 0.55 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var term = makeProper(Math.max(8, s.maxDen));
    var plus = Math.random() < 0.5;

    var right;
    var prompt;
    var reverseSteps;

    if (plus) {
      right = addFrac(xVal, term);
      prompt = "Solve for x:  x + " + formatFrac(term, false) + " = " + formatFrac(right, false);
      reverseSteps = [
        "Subtract " + formatFrac(term, false) + " from both sides.",
        "x = " + formatFrac(right, false) + " - " + formatFrac(term, false) + ".",
        "Simplify to get x = " + formatFrac(xVal, true) + "."
      ];
    } else {
      var extra = makeProper(Math.max(8, s.maxDen));
      xVal = addFrac(term, extra);
      right = subFrac(xVal, term);
      prompt = "Solve for x:  x - " + formatFrac(term, false) + " = " + formatFrac(right, false);
      reverseSteps = [
        "Add " + formatFrac(term, false) + " to both sides.",
        "x = " + formatFrac(right, false) + " + " + formatFrac(term, false) + ".",
        "Simplify to get x = " + formatFrac(xVal, true) + "."
      ];
    }

    return makeQuestion("s7_alg_plusminus", difficulty, {
      prompt: prompt,
      answer: xVal,
      answerMode: "fraction_simplest",
      methodsA: reverseSteps,
      methodsB: [
        "Move constant fraction term to opposite side with inverse operation.",
        "Keep equation balanced on both sides.",
        "Simplify the resulting expression for x."
      ],
      methodsC: [
        "Think of x as the missing part in an add/sub equation.",
        "Undo outer operation directly.",
        "Check by substitution immediately."
      ],
      shortcut: "For x +/- a = b, move a to the other side with the opposite sign.",
      pitfall: "Changing sign incorrectly when moving terms.",
      whyItWorks: "Inverse operations preserve equality and isolate unknown.",
      checks: "Substitute x and verify both sides.",
      lanes: {
        reverse: reverseSteps,
        clear: [
          "If fractions feel crowded, multiply through by LCM.",
          "Solve resulting equation with integers.",
          "Convert back to fraction if needed.",
          "Simplify final x.",
          "x = " + formatFrac(xVal, true) + "."
        ]
      },
      substitution: "Substitute x and verify equation matches exactly."
    });
  }

  function genS7AlgTwoStep(s, difficulty) {
    var xVal = Math.random() < 0.5 ? makeProper(Math.max(8, s.maxDen)) : makeImproper(Math.max(8, s.maxDen));
    var p = makeProper(Math.max(8, s.maxDen));
    var divisor = randInt(2, Math.min(8, s.maxDen));
    var subTerm = makeProper(Math.max(8, s.maxDen));
    var right = subFrac(divFrac(addFrac(xVal, p), frac(divisor, 1)), subTerm);

    return makeQuestion("s7_alg_twostep", difficulty, {
      prompt: "Solve for x:  (x + " + formatFrac(p, false) + ")/" + divisor + " - " + formatFrac(subTerm, false) + " = " + formatFrac(right, false),
      answer: xVal,
      answerMode: "fraction_simplest",
      methodsA: [
        "Add " + formatFrac(subTerm, false) + " to both sides first.",
        "Multiply both sides by " + divisor + ".",
        "Subtract " + formatFrac(p, false) + " to isolate x."
      ],
      methodsB: [
        "Treat as operation chain on x: +p, /" + divisor + ", then -term.",
        "Undo in reverse order.",
        "Simplify after each step to avoid fraction growth."
      ],
      methodsC: [
        "Compute right + subTerm first mentally.",
        "Scale by divisor.",
        "Subtract p as final step."
      ],
      shortcut: "Undo outermost operation first in bracket equations.",
      pitfall: "Multiplying before removing outside -term.",
      whyItWorks: "Composite expressions must be undone from outside to inside.",
      checks: "Substitute x and verify each operation order.",
      lanes: {
        reverse: [
          "Start: (x + " + formatFrac(p, false) + ")/" + divisor + " - " + formatFrac(subTerm, false) + " = " + formatFrac(right, false) + ".",
          "Add " + formatFrac(subTerm, false) + " to both sides.",
          "Multiply both sides by " + divisor + ".",
          "Subtract " + formatFrac(p, false) + ".",
          "x = " + formatFrac(xVal, true) + "."
        ],
        clear: [
          "Multiply whole equation by LCM to clear denominators.",
          "Expand bracket carefully.",
          "Collect x terms and constants.",
          "Solve linear equation.",
          "x = " + formatFrac(xVal, true) + "."
        ]
      },
      substitution: "Substitute x to confirm left side equals right side."
    });
  }

  function genS8Estimation(s, difficulty) {
    var a = makeProper(Math.max(8, s.maxDen));
    var b = makeProper(Math.max(8, s.maxDen));
    var ans = addFrac(a, b);
    var value = fractionValue(ans);

    var correctBand;
    if (value < 1) {
      correctBand = "0 < answer < 1";
    } else if (value < 2) {
      correctBand = "1 <= answer < 2";
    } else {
      correctBand = "2 <= answer < 3";
    }

    var choiceSet = makeChoiceSet(correctBand, [
      "answer < 0",
      "3 <= answer < 4",
      "answer is exactly 1/2"
    ]);

    return makeQuestion("s8_estimation", difficulty, {
      prompt: "Without full exact calculation, choose the best bound for " + formatFrac(a, false) + " + " + formatFrac(b, false) + ".",
      answer: choiceSet.answerId,
      answerMode: "choice",
      choices: choiceSet.choices,
      methodsA: [
        "Estimate each addend relative to 1.",
        "Add estimates to determine range band.",
        "Choose interval containing true sum."
      ],
      methodsB: [
        "Use common denominator quickly to estimate combined numerator.",
        "Compare to denominator for range above/below 1.",
        "Select matching bound."
      ],
      methodsC: [
        "Benchmark around halves and wholes.",
        "Use nearest simple fractions for quick mental range.",
        "Then select most plausible bound."
      ],
      shortcut: "Rough range first, exact arithmetic second.",
      pitfall: "Skipping estimation and trusting raw arithmetic only.",
      whyItWorks: "Bounds are preserved under addition and reveal impossible answers immediately.",
      checks: "After exact solve, ensure answer stays inside chosen bound."
    });
  }

  function genS8InverseCheck(s, difficulty) {
    var a = makeProper(Math.max(8, s.maxDen));
    var b = makeProper(Math.max(8, s.maxDen));
    var ans = addFrac(a, b);

    var correct = "Check by subtraction: " + formatFrac(ans, false) + " - " + formatFrac(b, false) + " = " + formatFrac(a, false);
    var choiceSet = makeChoiceSet(correct, [
      "Check by adding denominators only.",
      "Check by multiplying " + formatFrac(ans, false) + " and " + formatFrac(b, false) + ".",
      "No check is needed if answer looks reasonable."
    ]);

    return makeQuestion("s8_inverse_check", difficulty, {
      prompt: "A student solved " + formatFrac(a, false) + " + " + formatFrac(b, false) + " and got " + formatFrac(ans, false) + ". Which is the best inverse check?",
      answer: choiceSet.answerId,
      answerMode: "choice",
      choices: choiceSet.choices,
      methodsA: [
        "Use inverse operation of addition: subtraction.",
        "Subtract one addend from result.",
        "If it returns the other addend, check passes."
      ],
      methodsB: [
        "Recompute with alternative method (LCM vs butterfly).",
        "Compare with original answer.",
        "Agreement boosts reliability."
      ],
      methodsC: [
        "Estimate both sides to detect huge mismatch quickly.",
        "Then do exact inverse check.",
        "Fast and robust under exam pressure."
      ],
      shortcut: "Addition is checked by subtraction; multiplication by division.",
      pitfall: "Using unrelated operations as checks.",
      whyItWorks: "Inverse operations should recover original values when solution is correct.",
      checks: "Always include at least one inverse check on high-mark questions."
    });
  }

  function genS8SimplifyEnforce(s, difficulty) {
    var base = makeProper(Math.max(8, s.maxDen));
    var factor = randInt(2, 7);
    var raw = frac(base.n * factor, base.d * factor);

    return makeQuestion("s8_simplify_enforce", difficulty, {
      prompt: "After solving, a student wrote " + formatFrac(raw, false) + ". Write the final PSLE-ready simplified answer.",
      answer: base,
      answerMode: "fraction_simplest",
      methodsA: [
        "Find common factor of numerator and denominator.",
        "Divide both by common factor.",
        "Write simplest final answer."
      ],
      methodsB: [
        "Factor ladder reduction until no common factor remains.",
        "Confirm numerator and denominator are coprime.",
        "This is the exam-final format."
      ],
      methodsC: [
        "Check easy divisibility tests first (2,3,5).",
        "Perform rapid repeated simplification.",
        "Stop when further cancellation impossible."
      ],
      shortcut: "Final line check: simplify before writing answer.",
      pitfall: "Leaving equivalent but unsimplified fraction as final answer.",
      whyItWorks: "Simplest form is unique, so it is the standard final representation.",
      checks: "Multiply simplified form back by canceled factor to confirm raw form."
    });
  }

  function genS8Misconception(s, difficulty) {
    var choiceSet = makeChoiceSet(
      "The student added numerators and denominators directly, which is invalid for unlike denominators.",
      [
        "The student should always divide numerators first before any operation.",
        "The student should invert both fractions before addition.",
        "The student made no error."
      ]
    );

    return makeQuestion("s8_misconception", difficulty, {
      prompt: "Student work: 2/3 + 1/4 = 3/7. Identify the core misconception.",
      answer: choiceSet.answerId,
      answerMode: "choice",
      choices: choiceSet.choices,
      methodsA: [
        "Unlike denominators require common denominator first.",
        "Only numerators are added after denominator alignment.",
        "Denominator is never directly added for fraction sum."
      ],
      methodsB: [
        "Convert 2/3 and 1/4 to twelfths.",
        "Add resulting numerators.",
        "Show correct sum to contrast misconception."
      ],
      methodsC: [
        "Sanity check: 2/3 (~0.67) + 1/4 (0.25) ~ 0.92.",
        "But 3/7 (~0.43) is impossible.",
        "Estimate catches misconception instantly."
      ],
      shortcut: "If denominators differ, pause and align them before adding/subtracting.",
      pitfall: "Treating fractions like whole-number digit pairs.",
      whyItWorks: "Fraction denominator defines unit size; unlike units cannot be combined directly.",
      checks: "Always estimate decimal size to reject impossible outcomes."
    });
  }

  var GENERATOR_REGISTRY = {
    s1_forms: genS1Forms,
    s1_equivalent: genS1Equivalent,
    s1_numberline: genS1NumberLine,

    s2_compare: genS2Compare,
    s2_order: genS2Order,

    s3_add_unlike: genS3AddUnlike,
    s3_subtract_mixed: genS3SubtractMixed,

    s4_multiply: genS4Multiply,
    s4_divide: genS4Divide,

    s5_fraction_of_quantity: genS5FractionOfQuantity,
    s5_whole_from_part: genS5WholeFromPart,

    s6_before_after: genS6BeforeAfter,
    s6_remainder: genS6Remainder,
    s6_sequential: genS6Sequential,
    s6_same_total: genS6SameTotal,
    s6_word_algebra: genS6WordAlgebra,

    s7_alg_inverse: genS7AlgInverse,
    s7_alg_bracket: genS7AlgBracket,
    s7_alg_coefficient: genS7AlgCoefficient,
    s7_alg_plusminus: genS7AlgPlusMinus,
    s7_alg_twostep: genS7AlgTwoStep,

    s8_estimation: genS8Estimation,
    s8_inverse_check: genS8InverseCheck,
    s8_simplify_enforce: genS8SimplifyEnforce,
    s8_misconception: genS8Misconception
  };

    return GENERATOR_REGISTRY;
  };
})();
