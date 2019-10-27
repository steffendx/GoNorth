# GoNorth

GoNorth is a web application used for planning the story and world of RPGs or other open world games. GoNorth is cross-plattform ready, provides multilanguage support and is designed as a responsive layout. 

It offers modules for:
 * Timeline view to provide a quick overview of changes
 * Planning Chapters as a Node System of Quests
 * Planning Quests as a Node System of Tasks
 * Planning Npcs and their different values
 * Planning dialogs of Npcs as Node System of dialog branches
 * Planning Items and their different values
 * Planning Skills and their different values
 * Exporting of Npcs, Dialogs, Items and skills
 * Wiki component with versioning and tight integration into the other modules
 * Map component to position Quest marker, Npcs, Items, Wiki pages and map changes
 * Tracking your implementation status and showing changed values after change to already implemented object
 * Task Tracker
 * GDPR support

## Deployment
![Badge](https://leif-dev.visualstudio.com/_apis/public/build/definitions/31ab5f65-48ba-4e5b-a93d-590ba3af9850/2/badge)

Please refer to the [wiki for deployment details](https://github.com/steffendx/GoNorth/wiki/Deployment), [docker deployment details](https://github.com/steffendx/GoNorth/wiki/Docker-Deployment) and the [official documentation on how to host and deploy an ASP.NET Core application](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/?tabs=aspnetcore2x).

## Brief Overview

### Chapter and Quest Planning (Aika)
GoNorth provides a module for planning the different chapters of your game and the branching story.
For this it provides a node system which allows you to connect the different quests and their possible outcomes together:

![Chapter planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Aika.PNG?raw=true)

A similiar node system can be created for the different quests.  
Each quest will show the connections to Maps, Wiki pages and other objects to provide a view on the big picture while planning the quest.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Aika).

### Npc, Item and Skill Planning (Kortisto, Styr and Evne)
The web application provides functionality for planning Npcs, Items and Skills with flexible values. You can create templates and then create new Npcs, Items and Skills based on these templates:

![Npc planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Kortisto.PNG?raw=true)

Each object will display the different maps in which the Npc or Item is marked, the Wiki Pages in which its mentioned and all other connections. This way the user has a good overview what he or she has to consider when building the character or item.  
More details can be found in the wiki for [npcs](https://github.com/steffendx/GoNorth/wiki/Kortisto), [items](https://github.com/steffendx/GoNorth/wiki/Styr) and [skills](https://github.com/steffendx/GoNorth/wiki/Evne).

### Dialog Planning (Tale)
Using the dialog planning module a user can create the branching dialogs for the different game characters as a node system:

![Dialog planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Tale.PNG?raw=true)

GoNorth provides different dialog nodes for player or npc lines, player choices, conditions or actions.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Tale).

### Daily routine planning
To help you build a living world, GoNorth allows you to easily define a daily routine for any Npc:  

![Daily Routines](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/DailyRoutines.png?raw=true)  

You can define movement targets for npcs as well as scripts that are run at a certain time of day. This way you can really let your world come to live.  
More details can be found in the [wiki](https://github.com/steffendx/GoNorth/wiki/Kortisto)


### Exporting
GoNorth supports exporting Npcs, Dialogs, Skills and Items to JSON and scripts.

![Dialog planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/ScriptExporting.png?raw=true)

The scripts can be adjusted using a template system with different placeholders for values, learned skills, inventory and dialogs.  
For better localization support strings can be exported as language keys and localizable language files can be exported.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Export).  

To give an additional form of flexibility during exporting, GoNorth supports so called export snippets. These can be used to specify certain hooks in the templates that can be filled by the different npcs, items or skills. This way you can have a special behaviour when picking up an item like adding a quest log message for example.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Export-Snippets).


### Wiki Component (Kirja)
Kirja is the wiki component of GoNorth. Apart from allowing the user to write wiki pages it also features versioning and a tight integration into the other systems:

![Wiki](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Kirja.PNG?raw=true)

Kirja also allows the users to attach additional planning files.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Kirja).

### Map Planning (Karta)
A user can upload a high resolution map image to GoNorth which will then be transformed into an interactive map similiar to Google Maps. On this map a user can mark the position of Quest Markers, Npcs, Items, Wiki Pages and Map Changes:

![Map planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Karta.PNG?raw=true)

Each marker provides brief informations about the different objects and allow the users to jump of the detail page.  
A user can add addtional geometry like rectangles or polygons to a marker to indicate the affected area of the marker.
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Karta).

## Implementation Status Tracking
GoNorth allows you to mark objects as implemented once they are integrated into your game. If a user changes relevant values of theses objects afterwards GoNorth will reset the implemented flag and show you which values where changed:

![Implementation Status Tracking](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/ImplementationStatus.PNG?raw=true)

This way its much easier to keep track of the integration progress and not forget changes.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Implementation-Status-Tracking).

## Task Management
A Kanban Board supporting different task types is integrated into GoNorth:

![Task Management](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Task.PNG?raw=true)

More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Task-Management).

## Technology
GoNorth is implemented using .Net Core for the backend. Since .Net Core provides cross-plattform support you can host the portal on Windows, Linux and Mac OS.  
To store the values GoNorth currently uses a MongoDB System. Since GoNorth uses dependency injection and all database access is done through an interface it is possible to integrate a different database system. More details on this topic can be found in the wiki.  
Knockout is used for the frontend together with Bootstrap. The whole frontend is optimized for a responsive layout.   

## Browser Support
I've tested the web application using Chrome and Firefox. The portal might have problems running under Internet Explorer since this is a hobby, spare time project and I did not want to bother with all the Internet Explorer problems.

## Plans for the future
The next steps which I will implement in the future are:
 * Usability improvments
 * I am very open for feature requests and good ideas

## License
GoNorth is open source and released under the [MIT LICENSE](LICENSE).

Copyright (c) 2018, 2019 Steffen Noertershaeuser.

## Acknowledgement
GoNorth uses the following libraries:
 * [.Net Core](https://github.com/dotnet/core) licensed under MIT
 * [MongoDB](https://www.mongodb.com/) licensed under Apache License 2.0
 * [Bootstrap](https://getbootstrap.com/) licensed under MIT
 * [Knockout](http://knockoutjs.com/) licensed under MIT
 * [Leaflet](http://leafletjs.com/) licensed under BSD-License
 * [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) licensed under MIT
 * [Leaflet.TextPath](https://github.com/makinacorpus/Leaflet.TextPath) licensed under MIT
 * [JointJS](https://www.jointjs.com) licensed under Mozilla Public License Version 2.0
 * [SixLabors.ImageSharp](https://github.com/SixLabors/ImageSharp) licensed under Apache License 2.0
 * [Moment](https://github.com/moment/moment) licensed under MIT
 * [jQuery](https://jquery.org/) licensed under MIT
 * [jQuery UI](http://jqueryui.com/) licensed under MIT
 * [jQuery Validation](http://jqueryvalidation.org/) licensed under MIT
 * [Dropzone](https://github.com/enyo/dropzone) licensed under MIT
 * [bootstrap-wysiwyg](https://github.com/mindmup/bootstrap-wysiwyg) licensed under MIT
 * [bootstrap-tagsinput](https://github.com/bootstrap-tagsinput/bootstrap-tagsinput) licensed under MIT
 * [eonasdan-bootstrap-datetimepicker](https://github.com/Eonasdan/bootstrap-datetimepicker) licensed under MIT
 * [bootstrap-colorpicker](https://github.com/itsjavi/bootstrap-colorpicker) licensed under Apache License 2.0
 * [Fantasy Name Generator](https://github.com/skeeto/fantasyname) licensed under The Unlicense
 * [Ace Editor](https://ace.c9.io/) licensed under BSD-License
 * [knockout-sortable](https://github.com/rniemeyer/knockout-sortable/) licensed under MIT
 * [htmldiff.js](https://github.com/tnwinc/htmldiff.js) licensed under MIT
 * [mocha](https://github.com/mochajs/mocha) licensed under MIT
 * [Puppeteer](https://github.com/GoogleChrome/puppeteer) licensed under Apache License 2.0