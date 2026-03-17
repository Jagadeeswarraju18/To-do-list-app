import { findSubreddits } from './src/lib/platforms/reddit-generator';

const testQueries = [
    'spendyx help with expense tracking',
    'app development tools',
    'marketing strategy for saas',
    'personal finance management',
    'indie hacking and solopreneurship',
    'productivity apps and tools',
    'ai machine learning startup'
];

testQueries.forEach(query => {
    const results = findSubreddits(query);
    console.log(`\nQuery: "${query}"`);
    console.log(`Results Found: ${results.length}`);
    results.forEach((sub, i) => {
        if (i < 5 || results.length <= 10) {
            console.log(`  - ${sub.name} (${sub.relevance}): ${sub.reason}`);
        } else if (i === 5) {
            console.log(`  - ... and ${results.length - 5} more`);
        }
    });
});
