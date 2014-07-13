# LiveReload for Atom

An [Atom](https://atom.io/) package enables you to control built-in [LiveReload](http://livereload.com/) server.
> LiveReload monitors changes in the file system. As soon as you save a file, it is preprocessed as needed, and the browser is refreshed.
>
> Even cooler, when you change a CSS file or an image, the browser is updated instantly without reloading the page.
>
> *from LiveReload official site*

## Usage
1. Select main menu `Packages > LiveReload > Toggle Server` to turn the server on. Or, you can click `Toggle LiveReload` in the context menu to do same thing.
2. When the server started successfully, `LiveReload: PORT_NUMBER` text appears in the status bar(see the bottom right panel in the following screenshot).
   ![LiveReload status text](https://cloud.githubusercontent.com/assets/212034/3565696/c50f01ce-0aca-11e4-991e-4cb8475364c4.png)
3. Click it to get the url of `livereload.js` JavaScript file.
4. Put the script into the bottom of documents you want to give power of live reloading.

## Features
* Reloads web pages when any file is saved.
* Applies changes without reloading when any CSS or image changed.

## License
MIT
