export function listValues(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(listValues);
  if (typeof value === 'object') return Object.values(value).flatMap(listValues);
  return String(value)
    .split(/[,;·]/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function matchesAnySelection(values, selections) {
  if (!Array.isArray(selections) || selections.length === 0) return true;
  const candidates = values.flatMap(listValues).map(value => value.toLocaleLowerCase());
  return selections.some(selection => {
    const wanted = String(selection).toLocaleLowerCase();
    return candidates.some(candidate => candidate === wanted || candidate.includes(wanted));
  });
}

export function reviewCountOf(item) {
  if (Array.isArray(item?.reviews)) return item.reviews.length;
  return Number(item?.review_count ?? item?.reviews_count ?? item?.reviews ?? 0) || 0;
}

export function ratingOf(item) {
  if (Array.isArray(item?.reviews) && item.reviews.length > 0) {
    return item.reviews.reduce((sum, review) => sum + (Number(review?.rating) || 0), 0) / item.reviews.length;
  }
  return Number(item?.rating ?? item?.average_rating ?? 0) || 0;
}

export function recommendedComparator(a, b) {
  const ratingDifference = ratingOf(b) - ratingOf(a);
  if (ratingDifference) return ratingDifference;

  const positiveDifference = (Number(b?.positive_review_count) || 0) - (Number(a?.positive_review_count) || 0);
  if (positiveDifference) return positiveDifference;

  const reviewDifference = reviewCountOf(b) - reviewCountOf(a);
  if (reviewDifference) return reviewDifference;

  return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime();
}

export function newestComparator(a, b) {
  return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime();
}
