# SpeedRun Tool for Diablo 2 Resurrected

https://zeddicus-pl.github.io/d2rSpeedRun/

Custom CSS template for OBS browser:
```
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap');

/* all text except the "last read" line */
#stats * {
    font-family: "Josefin Sans";
    font-size: 30px;
}

/* labels */
#stats div div div div:first-child {
    width: 100px;
    color: blue;
    /* if you add "!important" in the end it overrides
    /* the colors on the first column, example: */
    /* color: blue; !important; */
}

/* values */
#stats div div div div:nth-child(2) {
    color: red;
}


/* "last read" line */
#stats > div:last-child {
    font-size: 25px !important;
}
```

(the CSP rules are configured to allow importing fonts only from google fonts)


### Notes from BK to himself in order to get this thing working.
You have to overwrite any version of package-lock.json with the contents of "package-lock - copy.json" ***prior to running "npm install"***, for some reason if you don't do this a bunch of modules don't install correctly.
For example materials-react-toastify will install v10.0.5, but that installation will be missing the critical "material-react-toastify.esm.js" files for some reason and you'd need to uninstall and reinstall that module for it to work. Who knows what else is breaking silently in the process on top of that.

To compile a working .exe you need to run "npm run make" and let that fail (since you're trying to build a linux version on a windows PC) *before* you run "npm run build-win". If you don't do this, the .exe file generated will just load an empty box. This is related to the separate usage of electron builder and electron forge for windows and linux OSes respectively - for some reason electron builder doesn't setup the webpack files initially, so you need electron forge to do that for you, then fail, then run electron builder.
