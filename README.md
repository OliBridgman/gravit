[![Build Status](https://travis-ci.org/quasado/gravit.svg?branch=master)](https://travis-ci.org/quasado/gravit)

## Introduction

Gravit is a design tool for Mac, Windows, Linux, ChromeOS and the Browser made
in the spirit for Freehand and Fireworks. It is completely written in HTML5,
Javascript and CSS3. Gravit consists of the core engine called "Infinity", the
actual Application and the core Module called "Gravit".

We'd like to encourage everyone in getting involved with this project. You can
develop new features or take a ticket and fix it. Or if you're a UX/Designer, you
could help designing new icons or improving the UI. To get started contributing,
read the [GitHub Guide](https://guides.github.com/activities/contributing-to-open-source/).

## Prerequisites

* NodeJS + NPM
* Grunt Client
* Bower
* SASS + Compass

## Quick Start

Install all prerequisites and make sure they're available on your path.

Then run `npm install` to install all nodejs dependencies.
Then run `bower install` to install all client javascript libraries.

Finally run `grunt`. You can then open Gravit in your
webbrowser at http://127.0.0.1:8999/.

We recommend using Chrome as this is the browser also used for the standalone
version.

## Quick Overview

+ assets - contains all relevant assets like fonts, images, etc.
+ shell - contains platform-specific code for standalone version
+ src - contains all source code
  + gravit - contains the gravit application
  + development - contains the development addon automatically loaded when developing
  + infinity - contains the core rendering engine as well as core classes used everywhere else
  + infinity-editor - contains editors, tools, guides and more based on infinity
+ style - contains all styling files for the application
+ test - contains all test files

## Community

Issues are being tracked here on GitHub.

## License

`Gravit`'s code in this repo uses the CC-NC-ND license, see our `LICENSE` file for detailed information.
In short this means:

*You are free to*

* Share — copy and redistribute the material in any medium or format
* The licensor cannot revoke these freedoms as long as you follow the license terms.

*Under the following terms:*

* Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
  You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
* NonCommercial — You may not use the material for commercial purposes.
* NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

The name Gravit, the Gravit Logo, the Gravit GUI as well as all related logos are exclusive trademarks
of Quasado e.K. and may not be used without prior written permission.

`Gravit`'s code is also available as a commercial license. For more information, contact us.
