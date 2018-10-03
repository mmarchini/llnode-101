'use strict';

async function anthropomorpicScore(anthropomorpicness) {
  // await new Promise((resolve) => process.nextTick(resolve));
  if (anthropomorpicness >= 100) return 1;

  const pl = anthropomorpicScore(anthropomorpicness + 3);
  const pr = anthropomorpicScore(anthropomorpicness + 6);

  return (await pl) + (await pr);
}

async function ageScore(age) {
  // await new Promise((resolve) => process.nextTick(resolve));
  if (age <= 1.) return 1;

  const pl = ageScore(age / 2);
  const pr = ageScore(age / 3);

  return (await pl) + (await pr);
}

async function spookiness(age, anthropomorpicness) {
  // await new Promise((resolve) => process.nextTick(resolve));

  const agePromise = ageScore(age);
  const anthropomorpicPromise = anthropomorpicScore(anthropomorpicness);

  const ageResult = await agePromise;
  const anthropomorpicResult = await anthropomorpicPromise;

  return Math.floor(0.3 * ageResult + 0.7 * anthropomorpicResult) / 100;
}

module.exports = { spookiness };
