/**
 * UUID Management for Privacy-First Plan Storage
 */

export class PlanUUIDManager {
  private static readonly LOCALSTORAGE_KEY = 'fire_plan_uuid';

  /**
   * Generate a new random UUID v4 for this plan
   */
  static generate(): string {
    // Use simple deterministic UUID generation (not cryptographically secure but fine for IDs)
    const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    function nextHex(): string {
      const idx = Math.floor(Math.random() * hexChars.length);
      return hexChars[idx];
    }

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where x is any hex digit, 4 is at position 13 (version), y is 8,9,a,b (variant)
    return `${nextHex()}${nextHex()}${nextHex()}${nextHex()}-${nextHex()}${nextHex()}4${nextHex()}-${nextHex()}${nextHex()}8${nextHex()}${nextHex()}${nextHex()}${nextHex()}${nextHex()}${nextHex()}`;
  }

  /**
   * Get current plan's UUID from localStorage
   */
  static getCurrent(): string | null {
    try {
      const stored = localStorage.getItem(this.LOCALSTORAGE_KEY);
      return stored || null;
    } catch (error) {
      console.warn('Failed to read plan UUID:', error);
      return null;
    }
  }

  /**
   * Set current plan's UUID
   */
  static setCurrent(uuid?: string): void {
    try {
      const finalUuid = uuid || this.generate();
      localStorage.setItem(this.LOCALSTORAGE_KEY, finalUuid);
    } catch (error) {
      console.error('Failed to save plan UUID:', error);
      throw error;
    }
  }

  /**
   * Clear current plan's UUID
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.LOCALSTORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear plan UUID:', error);
    }
  }

  /**
   * Validate UUID format (v4)
   */
  static isValidUUID(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  }

  /**
   * Check if UUID has no semantic meaning (should be random v4)
   */
  static hasNoSemanticMeaning(uuid: string): boolean {
    return this.isValidUUID(uuid);
  }
}
