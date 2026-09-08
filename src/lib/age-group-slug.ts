import { AGE_GROUPS, type AgeGroup } from '@/data/league';

export const ageGroupSlug = (id: AgeGroup): string => id.split('-')[0];

export const ageGroupFromSlug = (slug: string): AgeGroup | undefined =>
  AGE_GROUPS.find((g) => ageGroupSlug(g.id) === slug)?.id;
