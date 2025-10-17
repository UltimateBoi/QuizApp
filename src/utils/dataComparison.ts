/**
 * Utility functions for comparing local and cloud data to detect differences
 */

/**
 * Deep comparison of two arrays of objects, ignoring timestamps and metadata
 * @param local Local data array
 * @param cloud Cloud data array
 * @returns true if there are meaningful differences
 */
export function hasDataDifference<T extends { id: string }>(
  local: T[],
  cloud: T[]
): boolean {
  // Quick check: different lengths means different data
  if (local.length !== cloud.length) {
    return true;
  }

  // Create maps for efficient lookup
  const localMap = new Map(local.map(item => [item.id, item]));
  const cloudMap = new Map(cloud.map(item => [item.id, item]));

  // Check if all IDs match
  const localIds = new Set(local.map(item => item.id));
  const cloudIds = new Set(cloud.map(item => item.id));

  // If IDs don't match, there's a difference
  if (localIds.size !== cloudIds.size) {
    return true;
  }

  for (const id of localIds) {
    if (!cloudIds.has(id)) {
      return true;
    }
  }

  // Check content of each item (excluding metadata fields)
  for (const [id, localItem] of localMap) {
    const cloudItem = cloudMap.get(id);
    if (!cloudItem) {
      return true;
    }

    // Compare items excluding timestamp fields
    if (hasObjectDifference(localItem, cloudItem, ['updatedAt', 'createdAt', 'lastSync'])) {
      return true;
    }
  }

  return false;
}

/**
 * Compare two objects for differences, excluding specified fields
 * @param obj1 First object
 * @param obj2 Second object
 * @param excludeFields Fields to exclude from comparison
 * @returns true if objects are different
 */
export function hasObjectDifference(
  obj1: any,
  obj2: any,
  excludeFields: string[] = ['updatedAt', 'createdAt', 'lastSync']
): boolean {
  // Filter out excluded fields
  const filtered1 = filterObject(obj1, excludeFields);
  const filtered2 = filterObject(obj2, excludeFields);

  // Compare using JSON stringification (simple but effective for this use case)
  return JSON.stringify(filtered1) !== JSON.stringify(filtered2);
}

/**
 * Remove specified fields from an object
 */
function filterObject(obj: any, excludeFields: string[]): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => filterObject(item, excludeFields));
  }

  const filtered: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!excludeFields.includes(key)) {
      filtered[key] = filterObject(value, excludeFields);
    }
  }
  return filtered;
}

/**
 * Check if settings objects have differences
 */
export function hasSettingsDifference(local: any, cloud: any): boolean {
  return hasObjectDifference(local, cloud);
}
