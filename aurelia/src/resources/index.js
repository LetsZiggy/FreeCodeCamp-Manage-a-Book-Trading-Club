export function configure(config) {
  config.globalResources([
    './value-converters/authors',
    './elements/book',
    './elements/header.html',
    './elements/footer.html'
  ]);
}