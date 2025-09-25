/*
 * Main Entry Point - Swiss Army Knife Card
 * Modern modular architecture implementation
 */

import { version } from '../package.json';

// Import the main component
import './components/SakCard.js';

// Log version info
console.info(
  `%c  SWISS-ARMY-KNIFE-CARD  \n%c      Version ${version}      `,
  'color: yellow; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// Export for external use
export { SakCard } from './components/SakCard.js';
export * from './types/SakTypes.js';
