export class App {
  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Manage a Book Trading Club';
    config.map([
      {
        route: '',
        redirect: 'home'
      },
      {
        route: 'home',
        name: 'home',
        moduleId: './resources/modules/home',
        title: 'Home',
        nav: true,
      }
    ]);

    config.mapUnknownRoutes({ redirect: 'home' });
  }
}