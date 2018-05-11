export function configure(config) {
  config.globalResources([
    './value-converters/authors',
    './elements/book-selected',
    './elements/add-book',
    './elements/header.html',
    './elements/footer.html'
  ]);
}