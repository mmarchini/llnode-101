'use strict';

function anthropomorpicScore(anthropomorpicness) {
  if (anthropomorpicness >= 100) return new Promise((cb) => { cb(1); });

  const pl = anthropomorpicScore(anthropomorpicness + 3);
  const pr = anthropomorpicScore(anthropomorpicness + 6);

  return new Promise((resolve) => { process.nextTick(() => {
    pl.then((a) => {
      pr.then((b) => {
        resolve(a + b);
      });
    });
  }) } );
}

function ageScore(age) {
  if (age <= 1.) return new Promise((cb) => { cb(1); });

  const pl = ageScore(age / 2);
  const pr = ageScore(age / 3);

  return new Promise((resolve) => { process.nextTick(() => {
    pl.then((a) => {
      pr.then((b) => {
        resolve(a + b);
      });
    });
  }) } );
}

async function spookiness(age, anthropomorpicness) {
  const agePromise = ageScore(age);
  const anthropomorpicPromise = anthropomorpicScore(anthropomorpicness);

  const ageResult = await agePromise;
  const anthropomorpicResult = await anthropomorpicPromise;

  return Math.floor(0.3 * ageResult + 0.7 * anthropomorpicResult) / 100;
}

module.exports = { spookiness };
