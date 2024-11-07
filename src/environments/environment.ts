// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //baseUrl: 'http://127.0.0.1:8111/',
  baseUrl: 'https://beta.buzy.team/',
  //nodeUrl: 'http://127.0.0.1:8111/',
  nodeUrl: 'https://beta.buzy.team/',
  firebase: {
    apiKey: "AIzaSyAMXPdMHxBNySjj8mZb1XJB0nLphs_2y0g",
    authDomain: "myteam-d13ad.firebaseapp.com",
    databaseURL: "https://myteam-d13ad.firebaseio.com",
    projectId: "myteam-d13ad",
    storageBucket: "gs://myteam-d13ad.appspot.com",
    messagingSenderId: "531214457857"
  },
  pusher: {
    key: "56a602514c6a00bc5421",
    cluster: "ap2"
  }
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
