
// Balanced XP curve with soft cap
// Formula: 50 + level * 30 + min(level² * 0.5, 500)
// Level 1→2: 80 XP | Level 10→11: 380 XP | Level 50→51: 2080 XP
export const XP_LEVELS = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    return 50 + level * 30 + Math.min(level * level * 0.5, 500);
});
