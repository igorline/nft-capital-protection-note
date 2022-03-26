import { lazier } from 'eth-hooks/helpers';

// the components and pages are lazy loaded for performance and bundle size reasons
// code is in the component file

export const AvailablePools = lazier(() => import('./pools/Pools'), 'AvailablePools');
export const UserPools = lazier(() => import('./userPools/UserPools'), 'UserPools');
