export class AuthorsValueConverter {
  toView(arr) {
    if(arr) {
      let result = arr.reduce((acc, v, i, a) => {
        acc += v.trim();

        if(i + 1 !== a.length) {
          acc += ', ';
        }

        return(acc);
      }, '');

      return(result);
    }
    else {
      return;
    }
  }

  fromView(arr) {

  }
}