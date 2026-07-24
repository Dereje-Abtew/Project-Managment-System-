import ServiceProvider from './index';

// This file exists so AppRouter can lazy-import the /serviceprovider/read/:id route.
// The actual Read UI is the side panel inside the main ServiceProvider list page.
export default ServiceProvider;
